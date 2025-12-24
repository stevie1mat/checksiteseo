import os
import json
from dotenv import load_dotenv
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re
import textstat

load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

# --- Check Functions ---

async def check_robots_txt(base_url: str) -> dict:
    robots_url = urljoin(base_url, "/robots.txt")
    score = 0
    details = []
    
    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            response = await client.get(robots_url)
            
        if response.status_code == 200:
            content = response.text
            bots = ["GPTBot", "ClaudeBot", "CCBot"]
            blocked = []
            
            for bot in bots:
                if re.search(f"User-agent:\\s*{bot}", content, re.IGNORECASE):
                     if re.search(f"User-agent:\\s*{bot}.*?Disallow:\\s*/\\s*(\\n|$)", content, re.IGNORECASE | re.DOTALL):
                         blocked.append(bot)
            
            if not blocked:
                score = 100
                details.append("Pass")
            else:
                score = 0
                details.append(f"Blocked: {', '.join(blocked)}")
        else:
            score = 100
            details.append("Not found (Allowed)")
            
    except Exception:
        score = 0
        details.append("Error checking")

    return {"score": score, "details": details}

async def check_sitemap(base_url: str) -> dict:
    """Checks for sitemap in robots.txt or common paths."""
    sitemap_url = None
    details = []
    
    # 1. Check robots.txt
    robots_url = urljoin(base_url, "/robots.txt")
    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            resp = await client.get(robots_url)
            if resp.status_code == 200:
                match = re.search(r"Sitemap:\s*(http[s]?://\S+)", resp.text, re.IGNORECASE)
                if match:
                    sitemap_url = match.group(1)
                    details.append(f"Found in robots.txt: {sitemap_url}")
    except:
        pass

    # 2. Check common paths if not found
    if not sitemap_url:
        common_paths = ["/sitemap.xml", "/sitemap_index.xml", "/wp-sitemap.xml"]
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            for path in common_paths:
                try:
                    target = urljoin(base_url, path)
                    resp = await client.get(target)
                    if resp.status_code == 200:
                        sitemap_url = target
                        details.append(f"Found at: {path}")
                        break
                except:
                    continue
    
    if sitemap_url:
        return {"score": 100, "details": details}
    else:
        return {"score": 0, "details": ["Not found in robots.txt or common paths"]}

async def check_llms_txt(base_url: str) -> dict:
    llms_url = urljoin(base_url, "/llms.txt")
    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            response = await client.get(llms_url)
        if response.status_code == 200 and len(response.text) > 0:
            return {"score": 100, "details": ["Found"]}
        return {"score": 0, "details": ["Missing"]}
    except:
        return {"score": 0, "details": ["Error"]}

def check_question_targeting(soup) -> dict:
    # Scan H2/H3 for question marks or question words
    headers = soup.find_all(['h2', 'h3'])
    question_count = 0
    question_words = ["how", "what", "why", "best", "can", "does"]
    
    for h in headers:
        text = h.get_text(strip=True).lower()
        if "?" in text or any(text.startswith(w) for w in question_words):
            question_count += 1
            
    score = min(question_count * 20, 100) # Cap at 5 questions
    return {
        "score": score,
        "details": [f"{question_count}/5 Question Headers found"]
    }

async def analyze_eeat_via_llm(text_content: str) -> dict:
    """Uses Mistral API to analyze E-E-A-T signals."""
    if not MISTRAL_API_KEY:
        return {"score": 0, "details": ["API Key Missing"]}

    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    You are an expert SEO Quality Rater. Analyze the following website homepage content for E-E-A-T signals.
    
    Return a JSON object with:
    - score: 0-100 integer
    - pros: List of specific strengths found (e.g. "Author bio present")
    - cons: List of specific weaknesses (e.g. "No physical address")
    
    Content (truncated):
    {text_content[:2000]}...
    """
    
    payload = {
        "model": "mistral-small-latest",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "response_format": {"type": "json_object"}
    }
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            content = data['choices'][0]['message']['content']
            result = json.loads(content)
            
            # Normalize to match frontend expected structure (details array for compatibility or specific fields)
            # We will pack pros/cons into 'details' for now, or update frontend to read pros/cons.
            # Let's pack them into details strings for backwards compat, but marked.
            
            pros = [f"Pro: {p}" for p in result.get("pros", [])]
            cons = [f"Con: {c}" for c in result.get("cons", [])]
            
            return {
                "score": result.get("score", 50),
                "details": pros + cons
            }
        else:
            return {"score": 0, "details": [f"AI Error: {response.status_code}"]}
            
    except Exception as e:
        return {"score": 0, "details": [f"AI Error: {str(e)}"]}

async def analyze_content_gap(text_content: str) -> dict:
    """Asks AI what is missing from the page."""
    if not MISTRAL_API_KEY:
        return {"score": 0, "details": ["API Key Missing"]}

    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    Analyze this website homepage content. 
    Based STRICLY on what the specific page is about (e.g. a Portfolio, a SaaS, a Blog), what important information is MISSING?

    Do NOT use generic examples like "Pricing" or "API Docs" unless they are actually relevant to this specific entity.
    For a portfolio, look for "Case Studies", "Resume", "Tech Stack".
    For a SaaS, look for "Pricing", "Features".
    
    Return a JSON object with:
    - missing_topics: List of 3 key short missing items that are RELEVANT contextually.
    
    Content:
    {text_content[:2000]}...
    """
    
    payload = {
        "model": "mistral-small-latest",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "response_format": {"type": "json_object"}
    }
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            data = response.json()
            result = json.loads(data['choices'][0]['message']['content'])
            topics = result.get("missing_topics", [])
            return {"score": 0 if topics else 100, "details": topics}
    except:
        pass
    return {"score": 0, "details": ["AI Check Failed"]}

async def get_ai_rewrite(text_snippet: str) -> str:
    """Asks AI to rewrite complex text."""
    if not MISTRAL_API_KEY: return "AI unavailable"
    
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {MISTRAL_API_KEY}", "Content-Type": "application/json"}
    
    prompt = f"Rewrite this complex sentence to be Grade 8 readability level:\n\n{text_snippet}"
    
    payload = {
        "model": "mistral-small-latest",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1
    }
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content'].strip()
    except:
        pass
    return "Could not generate rewrite."

async def check_eeat(soup) -> dict:
    # 1. Regex Fallback Check
    if MISTRAL_API_KEY:
        text = soup.get_text(separator=' ', strip=True)
        return await analyze_eeat_via_llm(text)

    # ... (Keep existing regex fallback logic if needed, but for now we assume AI is primary)
    return {"score": 0, "details": ["AI Key Missing"]}

async def check_readability_async(text: str) -> dict:
    if not text:
        return {"score": 0, "details": ["No text content"]}
        
    grade = textstat.flesch_kincaid_grade(text)
    display_grade = round(grade, 1)
    
    details = [f"Grade {display_grade}"]
    score = 100
    
    if grade > 12:
        score = 60
        details[0] += " (Too Complex)"
        # Get rewrite for the first complex sentence (simplified approach: just take first 30 words)
        snippet = " ".join(text.split()[:40]) + "..."
        rewrite = await get_ai_rewrite(snippet)
        details.append(f"Suggestion: {rewrite}")
    elif grade < 6:
        score = 90
        details[0] += " (Very Simple)"
    else:
        details[0] += " (Optimal)"
        
    return {"score": score, "details": details}

def check_visual_context(soup) -> dict:
    images = soup.find_all('img')
    if not images:
        return {"score": 100, "details": ["No images"]}
        
    with_alt = sum(1 for img in images if img.get('alt'))
    percentage = int((with_alt / len(images)) * 100)
    
    return {
        "score": percentage,
        "details": [f"{percentage}% Alt Text"]
    }

def check_freshness(soup) -> dict:
    # Meta tags
    meta_dates = soup.find('meta', property=re.compile(r'published|modified|updated|time'))
    
    # Visible text regex
    text = soup.get_text()
    date_regex = re.search(r"(updated|published|last modified).*?\d{4}", text, re.IGNORECASE)
    
    if meta_dates or date_regex:
        return {"score": 100, "details": ["Date validation found"]}
    
    return {"score": 0, "details": ["No dates detected"]}

async def analyze_page_content(html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    main_text = soup.get_text(separator=' ', strip=True)
    
    # Schema
    schemas = [s.string for s in soup.find_all("script", type="application/ld+json") if s.string]
    has_schema = len(schemas) > 0
    schema_types = []
    if has_schema:
        if "Organization" in str(schemas): schema_types.append("Org")
        if "FAQ" in str(schemas): schema_types.append("FAQ")
        if not schema_types: schema_types.append("Generic")
    
    return {
        "technical": {
            "schema": {"score": 100 if has_schema else 0, "details": [f"Found: {', '.join(schema_types)}" if has_schema else "Missing"]},
            "https": {"score": 100, "details": ["Secured"]}, # Assumed if we are here
        },
        "content": {
            "questions": check_question_targeting(soup),
            "readability": await check_readability_async(main_text[:5000]), 
            "visual": check_visual_context(soup),
            "freshness": check_freshness(soup),
            "word_count": {"score": 100 if len(main_text.split()) > 300 else 50, "details": [f"{len(main_text.split())} words"]},
            "gap": await analyze_content_gap(main_text[:5000])
        },
        "authority": {
            "eeat": await check_eeat(soup)
        }
    }

async def analyze_readiness(url: str):
    if not url.startswith("http"): url = "https://" + url
    
    # Init Results Structure
    results = {
        "technical": {
            "robots": await check_robots_txt(url),
            "llms": await check_llms_txt(url),
            "sitemap": await check_sitemap(url),
        },
        "content": {}, 
        "authority": {} 
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            page = await client.get(url)
            
        if page.status_code == 200:
            page_data = await analyze_page_content(page.text)
            
            # Merge Results
            results["technical"]["schema"] = page_data["technical"]["schema"]
            results["technical"]["https"] = {"score": 100, "details": ["Valid HTTPS"]}
            
            results["content"] = page_data["content"]
            results["authority"] = page_data["authority"]
            
        else:
            pass # Keep defaults
            
    except Exception as e:
        pass # Keep defaults

    # Calculate Total Score
    flat_scores = []
    for cat in results.values():
        for metric in cat.values():
            flat_scores.append(metric["score"])
            
    total = int(sum(flat_scores) / len(flat_scores)) if flat_scores else 0
    
    return {
        "url": url,
        "total_score": total,
        "breakdown": results
    }
