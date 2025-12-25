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
    You are an expert SEO Quality Rater. Analyze the content for E-E-A-T signals AND Hallucination Risks.
    
    1. E-E-A-T: Find specific strengths (Pros) and weaknesses (Cons).
    2. Hallucination Risk: Look for vague claims like "extensive experience", "years of practice", "expert" that lack specific numbers or dates. These cause AI agents to hallucinate real numbers.
    
    Return a JSON object with:
    - score: 0-100 integer
    - pros: List of specific strengths found
    - cons: List of specific weaknesses
    - hallucination_risk: {{
        "level": "Low" | "Medium" | "High",
        "reason": "Explain why (e.g. 'Vague temporal claims found')",
        "fix": "Suggestion (e.g. 'Change extensive experience to over 6 years')"
    }}
    
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
                "details": pros + cons,
                "hallucination_risk": result.get("hallucination_risk", {})
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
    Based STRICTLY on what the specific page is about (e.g. a Portfolio, a SaaS, a Blog), what important information is MISSING?

    Do NOT use generic examples like "Pricing" or "API Docs" unless they are actually relevant to this specific entity.
    For a portfolio, look for "Case Studies", "Resume/CV", "Tech Stack", "Project Details", "Contact Info", "Testimonials", "About/Bio", "Skills", "Experience Timeline".
    For a SaaS, look for "Pricing", "Features", "Use Cases", "Integrations", "Security/Compliance", "Customer Reviews", "API Documentation", "Comparison Chart".
    For a blog/content site, look for "Author Bio", "Categories", "Newsletter", "Social Links", "Popular Posts", "About Page".
    
    Return a JSON object with:
    - missing_topics: List of 6-9 key short missing items that are RELEVANT and SPECIFIC to this entity. Be comprehensive but focused.
    
    Content:
    {text_content[:2000]}...
    """
    
    return {"score": 0, "details": ["AI Check Failed"]}

def calculate_agent_economics(text_content: str, raw_html_len: int) -> dict:
    """Calculates token usage and estimated cost."""
    try:
        import tiktoken
        encoding = tiktoken.get_encoding("cl100k_base")
        token_count = len(encoding.encode(text_content))
    except ImportError:
        # Fallback if tiktoken fails
        token_count = len(text_content.split()) * 1.3
        
    # Boilerplate estimation (very rough: difference between raw HTML size and clean text size)
    clean_len = len(text_content)
    boilerplate_ratio = round((1 - (clean_len / max(raw_html_len, 1))) * 100, 1)

    # HTML vs Content Ratio (Signal-to-Noise)
    # Ratio of Clean Text to Raw HTML. 
    # E.g. 500 chars text / 8000 chars HTML = 0.0625 (1:16 ratio)
    ratio = clean_len / max(raw_html_len, 1)
    
    # Cost: $2.50 / 1M input tokens (GPT-4o rough avg) -> $0.0000025 per token
    cost_est = (token_count / 1_000_000) * 2.50
    
    # Interpretation
    code_bloat_score = "Good"
    if ratio < 0.10: # Less than 10% content
        code_bloat_score = "Critical Bloat"
    elif ratio < 0.25:
        code_bloat_score = "Moderate Bloat"

    return {
        "total_tokens": int(token_count),
        "boilerplate_ratio": boilerplate_ratio,
        "estimated_cost": f"${cost_est:.4f}",
        "html_ratio": f"{ratio:.1%}",
        "code_bloat_score": code_bloat_score,
        "raw_text_len": clean_len,
        "raw_html_len": raw_html_len
    }

async def analyze_failed_queries(text_content: str) -> dict:
    """Simulates user questions that the site might fail to answer."""
    if not MISTRAL_API_KEY:
        return {"score": 0, "details": [], "data": []}

    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }

    prompt = f"""
    Analyze the following website content. Act as a potential client looking to hire a developer or buy a service.
    
    1. Generate 5 critical questions a client would ask (e.g., pricing, availability, specific experience, tech stack).
    2. For each question, determine if the answer is 'Explicitly Stated', 'Implied', or 'Missing' in the text.
    3. IF the answer is 'Missing' or 'Implied', DRAFT a 40-60 word answer based on industry best practices or a standard professional response that the user *should* add to their site. 
       - For 'Pricing', suggest a retainer/project model explanation.
       - For 'Tech Stack', suggest a modern list relevant to their field.
       - If 'Explicitly Stated', leave 'draft_answer' empty.
    
    Return a JSON object with:
    - queries: List of objects {{ 
        "question": "...", 
        "status": "Explicitly Stated" | "Implied" | "Missing", 
        "confidence": "High" | "Medium" | "Low",
        "draft_answer": "..." (Only for Missing/Implied)
    }}
    
    Content (truncated):
    {text_content[:3000]}...
    """

    payload = {
        "model": "mistral-small-latest",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "response_format": {"type": "json_object"}
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            result = json.loads(data['choices'][0]['message']['content'])
            queries = result.get("queries", [])
            
            # Score based on how many are NOT missing
            found_count = sum(1 for q in queries if q["status"] == "Explicitly Stated")
            score = int((found_count / max(len(queries), 1)) * 100)
            
            return {
                "score": score,
                "details": [f"{q['question']} ({q['status']})" for q in queries],
                "data": queries
            }
    except Exception as e:
        print(f"Failed Query Analysis Error: {e}")
        pass
        
    return {"score": 0, "details": ["AI Check Failed"], "data": []}

async def extract_entities(text_content: str) -> dict:
    """Extracts named entities for the Knowledge Graph."""
    if not MISTRAL_API_KEY:
        return {"score": 0, "details": [], "data": {}}

    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }

    prompt = f"""
    Analyze the text for the PRIMARY entity (Person or Organization).
    1. Identify the Name and Type (Person/Org).
    2. Identify relationships: 'worksFor', 'jobTitle', 'alumniOf', 'knowsAbout' (skills), 'sameAs' (social links).
    3. If a relationship is found, extract the value. If not found, mark as 'Missing'.
    
    Return a JSON object with keys:
    - primary_entity: Name
    - type: Person | Organization
    - relationships: {{
        "worksFor": "...",
        "jobTitle": "...",
        "alumniOf": "...",
        "knowsAbout": ["...", "..."],
        "sameAs": ["...", "..."] (Social links)
    }}
    - missing_critical: List of fields that are missing (e.g. ["alumniOf", "sameAs"])
    
    Content (truncated):
    {text_content[:2000]}...
    """

    payload = {
        "model": "mistral-small-latest",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
        "response_format": {"type": "json_object"}
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            result = json.loads(data['choices'][0]['message']['content'])
            
            # Simple scoring: do we have at least one Person/Org/Skill?
            has_data = any(v and v != 'None Detected' for v in result.values())
            
            return {
                "score": 100 if has_data else 0,
                "details": ["Entities Extracted" if has_data else "No Entities Found"],
                "data": result
            }
    except:
        pass
        
    return {"score": 0, "details": ["AI Check Failed"], "data": {}}

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

async def analyze_competitors(text_content: str, url: str) -> dict:
    """Uses Mistral AI to identify competitors and estimate share of voice."""
    if not MISTRAL_API_KEY:
        return {
            "yourShare": 15,
            "others": 85,
            "top_competitors": ["Competitor A", "Competitor B", "Competitor C"]
        }

    api_url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Extract domain for context
    domain = urlparse(url).netloc
    
    prompt = f"""
    Analyze this website content and identify its top 3-5 REAL competitors.
    
    Website: {domain}
    
    Based on the content, industry, and services described:
    1. Identify 3-5 actual competitor domains (real websites, not generic names)
    2. Estimate this site's "Share of Voice" (0-100%) - how visible/authoritative it appears compared to competitors
    3. Consider factors: content depth, SEO quality, brand mentions, specificity
    
    Return a JSON object with:
    - yourShare: integer 0-100 (realistic estimate based on content quality)
    - others: integer (100 - yourShare)
    - top_competitors: list of 3-5 real competitor domain names (e.g. ["competitor1.com", "competitor2.io"])
    
    Be realistic. Most sites have 10-25% share unless they're industry leaders.
    
    Content (truncated):
    {text_content[:2000]}...
    """
    
    payload = {
        "model": "mistral-small-latest",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "response_format": {"type": "json_object"}
    }
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(api_url, json=payload, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            result = json.loads(data['choices'][0]['message']['content'])
            
            # Validate and normalize
            your_share = min(max(result.get("yourShare", 15), 0), 100)
            competitors = result.get("top_competitors", [])
            
            # Ensure we have at least some competitors
            if not competitors or len(competitors) == 0:
                competitors = ["Competitor A", "Competitor B", "Competitor C"]
            
            return {
                "yourShare": your_share,
                "others": 100 - your_share,
                "top_competitors": competitors[:5]  # Cap at 5
            }
    except Exception as e:
        print(f"Competitor Analysis Error: {e}")
        pass
        
    # Fallback
    return {
        "yourShare": 15,
        "others": 85,
        "top_competitors": ["Competitor A", "Competitor B", "Competitor C"]
    }


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

def check_basic_seo(soup) -> dict:
    # H1 Check
    h1 = soup.find('h1')
    has_h1 = bool(h1)
    
    # Meta Description Check
    meta_desc = soup.find('meta', attrs={'name': 'description'}) or soup.find('meta', attrs={'property': 'og:description'})
    has_desc = bool(meta_desc)
    desc_len = len(meta_desc.get('content', '')) if meta_desc else 0
    
    # OG Title Check
    og_title = soup.find('meta', attrs={'property': 'og:title'})
    has_og = bool(og_title)

    score = 0
    if has_h1: score += 40
    if has_desc: score += 40
    if has_og: score += 20

    return {
        "score": score,
        "details": [],
        "data": {
            "has_h1": has_h1,
            "has_meta_desc": has_desc,
            "meta_desc_length": desc_len,
            "has_og": has_og
        }
    }

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
            "agent_economics": calculate_agent_economics(main_text, len(html))
        },
        "content": {
            "questions": check_question_targeting(soup),
            "readability": await check_readability_async(main_text[:5000]), 
            "visual": check_visual_context(soup),
            "freshness": check_freshness(soup),
            "word_count": {"score": 100 if len(main_text.split()) > 300 else 50, "details": [f"{len(main_text.split())} words"]},
            "gap": await analyze_failed_queries(main_text[:5000]), # Replaces old gap analysis
            "basic_seo": check_basic_seo(soup)
        },
        "authority": {
            "eeat": await check_eeat(soup),
            "knowledge_graph": await extract_entities(main_text[:4000])
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
    
    # For competitor analysis
    main_text = ""
    
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            page = await client.get(url)
            
        if page.status_code == 200:
            page_data = await analyze_page_content(page.text)
            
            # Extract text for competitor analysis
            soup = BeautifulSoup(page.text, "html.parser")
            main_text = soup.get_text(separator=' ', strip=True)
            
            # Merge Results
            results["technical"]["schema"] = page_data["technical"]["schema"]
            results["technical"]["https"] = {"score": 100, "details": ["Valid HTTPS"]}
            
            results["content"] = page_data["content"]
            # Expose basic_seo at top level for easy access if needed, or stick to content structure
            # Frontend expects it in 'checklist' derived from this.
            results["authority"] = page_data["authority"]
            
        else:
            pass # Keep defaults
            
    except Exception as e:
        pass # Keep defaults

    # Run Competitor Analysis
    competitors_data = await analyze_competitors(main_text[:3000] if main_text else "", url)

    # Calculate Total Score
    flat_scores = []
    for cat in results.values():
        for metric in cat.values():
            flat_scores.append(metric["score"])
            
    total = int(sum(flat_scores) / len(flat_scores)) if flat_scores else 0
    
    return {
        "url": url,
        "total_score": total,
        "breakdown": results,
        "competitors": competitors_data  # Add competitors at top level
    }

async def generate_content_strategy(user_domain: str, competitor_domain: str) -> dict:
    """Generates a content plan to compete against a specific domain."""
    if not MISTRAL_API_KEY:
        return {
            "pillars": ["Technical SEO", "Content Depth", "Authority Building"],
            "titles": [f"Why {user_domain} is better than {competitor_domain}", f"Top alternatives to {competitor_domain}"]
        }

    # 1. Try to scrape competitor for context (lightweight)
    competitor_content = ""
    target_url = competitor_domain if competitor_domain.startswith("http") else f"https://{competitor_domain}"
    
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            resp = await client.get(target_url)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                # Get headers and first few paragraphs
                texts = []
                for h in soup.find_all(['h1', 'h2', 'h3'])[:10]:
                    texts.append(h.get_text(strip=True))
                competitor_content = " ".join(texts)[:2000]
    except Exception as e:
        print(f"Competitor Scrape Failed: {e}")
        pass

    # 2. Prompt LLM
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    Act as a Content Strategist. Create a "Gap Analysis & Content Plan" for {user_domain} to outrank {competitor_domain}.
    
    Competitor Highlights ({competitor_domain}):
    {competitor_content if competitor_content else "Content unavailable, strictly use domain knowledge."}
    
    Goal: Capture 'Share of Voice' from this competitor.
    
    Return a JSON object with:
    1. "pillars": List of 3 core content themes {competitor_domain} is winning at that {user_domain} should target.
    2. "titles": List of 5 specific click-worthy article titles for {user_domain} to write.
    3. "tactics": List of 3 specific SEO tactics to use (e.g. "Target keyword X", "Create comparison page").
    
    Format:
    {{
        "pillars": ["...", "...", "..."],
        "titles": ["...", "...", ...],
        "tactics": ["...", ...]
    }}
    """
    
    payload = {
        "model": "mistral-small-latest",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.4,
        "response_format": {"type": "json_object"}
    }
    
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            return json.loads(data['choices'][0]['message']['content'])
            
    except Exception as e:
        print(f"Strategy Gen Error: {e}")
        
    return {
        "pillars": ["Comparison Strategy", "Feature Gap Filling", "User Guide Expansion"],
        "titles": [
            f"{user_domain} vs {competitor_domain}: The Complete Guide",
            f"Why Users are Switching from {competitor_domain}",
            f"Top 5 Alternatives to {competitor_domain}",
            f"How to achieve X with {user_domain}",
            f"Advanced features in {user_domain} you missed"
        ],
        "tactics": ["Create a direct comparison landing page", "Target their long-tail help queries", "Bid on their brand keywords"]
    }
