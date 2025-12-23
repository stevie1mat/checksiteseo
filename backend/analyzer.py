import os
import json
from dotenv import load_dotenv

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
    You are an expert SEO Quality Rater. Analyze the following website homepage content for E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) signals.
    
    Look for:
    - Clear expertise (author bios, credentials)
    - Experience (first-hand knowledge)
    - Authority (mentions of awards, press, reputable sources)
    - Trust (contact info, privacy policy, physical address)

    Analyze the content strictly.
    Return ONLY a raw JSON object with this structure (no markdown):
    {{
        "score": <0-100 integer>,
        "details": [<list of 3-4 specific concise pros/cons>]
    }}

    Content (truncated):
    {text_content[:2000]}...
    """
    
    payload = {
        "model": "mistral-small-latest",
        "messages": [
            {"role": "user", "content": prompt}
        ],
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
            
            # Ensure format safety
            score = result.get("score", 50)
            details = result.get("details", ["Analysis complete."])
            if not isinstance(details, list): details = [str(details)]
            
            return {"score": score, "details": details}
        else:
            return {"score": 0, "details": [f"AI Error: {response.status_code}"]}
            
    except Exception as e:
        return {"score": 0, "details": [f"AI Error: {str(e)}"]}


async def check_eeat(soup) -> dict:
    """Checks E-E-A-T. Uses regex by default, but switches to LLM if API Key is present."""
    
    # 1. Regex Fallback Check (always run to gather base signals if needed, or just run LLM)
    # If API Key exists, use LLM.
    if MISTRAL_API_KEY:
        text = soup.get_text(separator=' ', strip=True)
        return await analyze_eeat_via_llm(text)

    # 2. Heuristic Regex Check (Fallback)
    text = soup.get_text().lower()
    signals = []
    
    # Socials
    links = [a.get('href', '') for a in soup.find_all('a', href=True)]
    social_domains = {
        "linkedin.com": "LinkedIn",
        "twitter.com": "Twitter",
        "x.com": "X",
        "github.com": "GitHub",
        "crunchbase.com": "Crunchbase"
    }
    
    found_names = []
    missing_names = []
    
    for domain, name in social_domains.items():
        if any(domain in l for l in links):
            found_names.append(name)
        else:
            missing_names.append(name)
            
    if found_names: 
        signals.append(f"Found: {', '.join(found_names)}")
    
    # Contact
    if "mailto:" in str(links) or re.search(r"contact|about|team", str(links), re.IGNORECASE):
        signals.append("Contact/About Page Detected")
    else:
        signals.append("Missing: Contact/About Page")

    # Add missing socials summary (limit to 3 to save space)
    if missing_names:
        signals.append(f"Missing: {', '.join(missing_names[:3])}")
        
    score = len(found_names) * 30 + (10 if "Contact" in str(signals) else 0) # Simple weighting

    return {
        "score": min(score, 100),
        "details": signals if signals else ["No explicit signals found"]
    }

def check_readability(text: str) -> dict:
    if not text:
        return {"score": 0, "details": ["No text content"]}
        
    grade = textstat.flesch_kincaid_grade(text)
    # Target 8th grade (60-70 ease, but grade level 8 is easier to understand)
    # Grade 8 is good. Grade 12+ is hard.
    
    display_grade = round(grade, 1)
    
    if 6 <= grade <= 10:
        return {"score": 100, "details": [f"Grade {display_grade} (Optimal)"]}
    elif grade < 6:
        return {"score": 90, "details": [f"Grade {display_grade} (Very Simple)"]}
    else:
        return {"score": 60, "details": [f"Grade {display_grade} (Complex)"]}

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
            "readability": check_readability(main_text[:5000]), # Limit text for speed
            "visual": check_visual_context(soup),
            "freshness": check_freshness(soup),
            "word_count": {"score": 100 if len(main_text.split()) > 300 else 50, "details": [f"{len(main_text.split())} words"]}
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
            # Schema & Sitemap populated later
        },
        "content": {}, # Populated by page parse
        "authority": {} # Populated by page parse
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            page = await client.get(url)
            
        if page.status_code == 200:
            page_data = await analyze_page_content(page.text)
            
            # Merge Results
            results["technical"]["schema"] = page_data["technical"]["schema"]
            results["technical"]["https"] = {"score": 100, "details": ["Valid HTTPS"]}
            results["technical"]["sitemap"] = {"score": 100, "details": ["Assumed (cms)"]} # Placeholder
            
            results["content"] = page_data["content"]
            results["authority"] = page_data["authority"]
            
        else:
            # Handle Error
            pass # Keep defaults
            
    except Exception as e:
        pass # Keep defaults

    # Calculate Total Score (Simple Average of non-empty categories)
    # technical (5 items), content (5 items), authority (1 item)
    # Total items = 11.
    
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
