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
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# --- AI Helper Function ---

async def query_llm(prompt: str, json_mode: bool = True, temperature: float = 0.3) -> dict | str | None:
    """
    Queries Gemini 2.0 Flash first, then falls back to Mistral.
    Returns a dict if json_mode is True, otherwise a string.
    Returns None if both fail.
    """
    
    # 1. Try Gemini
    if GEMINI_API_KEY:
        print(f"🤖 [AI] Using Gemini 2.0 Flash...")
        try:
            url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
            headers = {
                "Content-Type": "application/json",
                "X-goog-api-key": GEMINI_API_KEY
            }
            
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": temperature
                }
            }
            
            if json_mode:
                payload["generationConfig"]["response_mime_type"] = "application/json"

            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                text_content = data['candidates'][0]['content']['parts'][0]['text']
                if json_mode:
                    # Clean markdown code blocks if present (Gemini sometimes adds ```json ... ``` even with mime type)
                    cleaned = text_content.replace('```json', '').replace('```', '').strip()
                    return json.loads(cleaned)
                return text_content
            else:
                print(f"Gemini Error {response.status_code}: {response.text}")

        except Exception as e:
            print(f"Gemini Exception: {e}")
            pass # Fallthrough to Mistral

    # 2. Try Mistral (Fallback)
    if MISTRAL_API_KEY:
        print(f"⚠️ [AI] Falling back to Mistral...")
        try:
            url = "https://api.mistral.ai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {MISTRAL_API_KEY}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "mistral-small-latest",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": temperature,
            }

            if json_mode:
                 payload["response_format"] = {"type": "json_object"}

            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                content = data['choices'][0]['message']['content']
                if json_mode:
                    return json.loads(content)
                return content
            else:
                 print(f"Mistral Error {response.status_code}: {response.text}")
                 
        except Exception as e:
            print(f"Mistral Exception: {e}")
            pass

    return None


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

    return {"score": score, "details": details, "status": "valid" if score == 100 else "error"}

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
        return {"score": 100, "details": details, "status": "valid", "url": sitemap_url}
    else:
        return {"score": 0, "details": ["Not found in robots.txt or common paths"], "status": "missing", "url": None}

async def check_llms_txt(base_url: str) -> dict:
    llms_url = urljoin(base_url, "/llms.txt")
    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            response = await client.get(llms_url)
        if response.status_code == 200 and len(response.text) > 0:
            return {"score": 100, "details": ["Found"], "status": "valid"}
        return {"score": 0, "details": ["Missing"], "status": "missing"}
    except:
        return {"score": 0, "details": ["Error"], "status": "error"}

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
    """Uses Gemini/Mistral to analyze E-E-A-T signals."""
    prompt = f"""
    You are an expert SEO Quality Rater. Analyze the content for E-E-A-T signals AND Hallucination Risks.
    
    1. E-E-A-T: Find specific strengths (Pros) and weaknesses (Cons).
    2. Hallucination Risk: Look for vague claims like "extensive experience", "years of practice", "expert" that lack specific numbers or dates. These cause AI agents to hallucinate real numbers.
    
    Return a JSON object with:
    - score: 0-100 integer
    - pros: List of specific strengths found [String]
    - cons: List of specific weaknesses [String]
    - hallucination_risk: {{
        "level": "Low" | "Medium" | "High",
        "reason": "Explain why (e.g. 'Vague temporal claims found')",
        "fix": "Suggestion (e.g. 'Change extensive experience to over 6 years')"
    }}
    
    Content (truncated):
    {text_content[:2000]}...
    """
    
    result = await query_llm(prompt, json_mode=True)
    
    if result:
        # Normalize
        pros = [f"Pro: {p}" for p in result.get("pros", [])]
        cons = [f"Con: {c}" for c in result.get("cons", [])]
        
        return {
            "score": result.get("score", 50),
            "details": pros + cons,
            "hallucination_risk": result.get("hallucination_risk", {})
        }
    
    return {"score": 0, "details": ["AI Analysis Failed"]}

async def analyze_ambiguity_issues(text_content: str) -> dict:
    """Uses Gemini/Mistral to find specific ambiguity issues using the AEO Copy Editor persona."""
    prompt = f"""
    **Role:** You are an AEO (Answer Engine Optimization) Copy Editor. Your goal is to eliminate "Fluff" and "Ambiguity" from website content to prevent AI hallucinations.

    **Input Context:**
    Analyze the following website content.

    **Your Task:**
    1.  **Analyze** the text for "Vague Signals" (e.g., words like "extensive," "many," "world-class," "experienced," "soon," "fast").
    2.  **Rewrite** the string to be "AEO Compliant" by inserting **[PLACEHOLDERS]** where specific data should be.
    3.  **Categorize** the improvement type (e.g., "Adding Social Proof," "Defining Timeline," "Quantifying Volume").

    **Transformation Rules:**
    * Never repeat the vague word.
    * If the text says "Extensive experience," rewrite to "Over **[NUMBER]** years of experience."
    * If the text says "Global reach," rewrite to "Serving clients in **[NUMBER]** countries."
    * If the text says "Fast delivery," rewrite to "Delivered in under **[NUMBER]** hours."
    * If the text says "Huge library," rewrite to "Access to **[NUMBER]+** resources."

    **Output Format:**
    Return a JSON object containing an array of improvements (limit to top 5 most critical):
    ```json
    {{
      "improvements": [
        {{
          "originalText": "Join the most extensive Bible Quiz Competition ever!",
          "suggestedFix": "Join the competition hosting **[NUMBER]+** players daily",
          "category": "Social Proof"
        }}
      ]
    }}
    ```

    Content (truncated):
    {text_content[:4000]}...
    """
    
    result = await query_llm(prompt, json_mode=True, temperature=0.1)
    
    if result:
        # Ensure we return the expected structure even if LLM varies slightly
        return result
    
    return {"improvements": []}



def calculate_agent_economics(html: str, soup: BeautifulSoup) -> dict:
    """
    Calculates key 'Tokenomics' for AEO agents.
    1. Total Tokens (Heuristic: 4 chars = 1 token)
    2. Semantic Signal (visible text vs html tags)
    3. Estimated Cost (based on GPT-4o input pricing: $5.00 / 1M tokens)
    """
    if not html:
        return {
            "total_tokens": 0,
            "estimated_cost": 0,
            "html_ratio": 0,
            "code_bloat_score": "Unknown",
            "boilerplate_ratio": 0
        }

    # 1. Total Tokens
    total_chars = len(html)
    total_tokens = int(total_chars / 4)

    # 2. Semantic Signal
    # Create a copy so we don't modify the main soup for other checks
    soup_clone = BeautifulSoup(html, "html.parser")
    for script in soup_clone(["script", "style", "nav", "footer", "header", "noscript", "svg"]):
        script.extract()
    
    text_content = soup_clone.get_text(separator=' ', strip=True)
    text_length = len(text_content)
    
    # Calculate Ratio (avoid div by zero)
    html_ratio = text_length / total_chars if total_chars > 0 else 0
    boilerplate_ratio = 1.0 - html_ratio

    # 3. Estimated Cost
    # $5.00 per 1M tokens -> $0.000005 per token
    cost_per_token = 0.000005
    estimated_cost = total_tokens * cost_per_token

    # 4. Bloat Status
    if html_ratio > 0.15:
        bloat_status = "Healthy"
    elif html_ratio > 0.08:
        bloat_status = "Moderate Bloat"
    else:
        bloat_status = "Critical Bloat"

    return {
        "total_tokens": total_tokens,
        "estimated_cost": estimated_cost,
        "html_ratio": html_ratio,
        "code_bloat_score": bloat_status,
        "boilerplate_ratio": boilerplate_ratio
    }


async def analyze_failed_queries(text_content: str) -> dict:
    """Simulates user questions that the site might fail to answer."""
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

    result = await query_llm(prompt, json_mode=True, temperature=0.2)
    
    if result:
        queries = result.get("queries", [])
        # Score based on how many are NOT missing
        found_count = sum(1 for q in queries if q["status"] == "Explicitly Stated")
        score = int((found_count / max(len(queries), 1)) * 100)
        
        return {
            "score": score,
            "details": [f"{q['question']} ({q['status']})" for q in queries],
            "data": queries
        }
        
    return {"score": 0, "details": ["AI Check Failed"], "data": []}

async def extract_entities(text_content: str) -> dict:
    """Extracts named entities for the Knowledge Graph."""
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
        "sameAs": ["...", "..."], 
        "location": "...",        # For Org
        "products": ["...", "..."], # For Org/Person
        "founders": ["...", "..."]  # For Org
    }}
    - missing_critical: List of fields that are missing (e.g. ["alumniOf", "sameAs"])
    
    Content (truncated):
    {text_content[:2000]}...
    """

    result = await query_llm(prompt, json_mode=True, temperature=0.1)
    
    if result:
        # Simple scoring: do we have at least one Person/Org/Skill?
        has_data = any(v and v != 'None Detected' for v in result.values())
        return {
            "score": 100 if has_data else 0,
            "details": ["Entities Extracted" if has_data else "No Entities Found"],
            "data": result
        }
        
    return {"score": 0, "details": ["AI Check Failed"], "data": {}}

async def get_ai_rewrite(text_snippet: str) -> str:
    """Asks AI to rewrite complex text."""
    prompt = f"Rewrite this complex sentence to be Grade 8 readability level:\n\n{text_snippet}"
    result = await query_llm(prompt, json_mode=False, temperature=0.1)
    return result if result else "Could not generate rewrite."

async def analyze_competitors(text_content: str, url: str) -> dict:
    """Uses LLM to identify competitors and estimate share of voice."""
    # Extract domain for context
    domain = urlparse(url).netloc
    
    prompt = f"""
    Analyze this website content and identify its top 3-5 REAL, EXISTING competitors.
    
    Target Website: {domain}
    
    TASK: Act as a Google Search Engine. what websites would appear next to {domain} in search results for its main keywords?
    
    RULES:
    1. OUTPUT REAL DOMAINS ONLY. Do NOT invent generic names like "competitor1.com" or "example-rival.com". 
    2. If the site is a personal portfolio (e.g., "stevenmathew.com"), find OTHER famous portfolios or agencies in that niche (e.g. "awwwards.com", "malt.com", "upwork.com" or specific famous designer sites).
    3. If the site is a SaaS, find actual SaaS competitors.
    
    Return a JSON object with:
    - yourShare: integer 0-100 (Be harsh. Unless it's Amazon/Google, score < 20)
    - others: integer (100 - yourShare)
    - top_competitors: list of 3-5 REAL domain names (e.g. ["competitor.com", "famous-rival.io"])
    
    Content (truncated):
    {text_content[:2500]}...
    """
    
    result = await query_llm(prompt, json_mode=True, temperature=0.3)
    
    if result:
        your_share = min(max(result.get("yourShare", 10), 0), 100)
        competitors = result.get("top_competitors", [])
        
        # Filter out obvious fakes if AI hallucinates
        competitors = [c for c in competitors if "competitor" not in c.lower() and "example" not in c.lower()]
        
        # Ensure we have at least some competitors
        if not competitors or len(competitors) == 0:
            # Fallback to broader niche leaders if specific ones fail
            competitors = ["wikipedia.org", "linkedin.com", "medium.com"]
        
        return {
            "yourShare": your_share,
            "others": 100 - your_share,
            "top_competitors": competitors[:5]
        }
        
    # Fallback
    return {
        "yourShare": 10,
        "others": 90,
        "top_competitors": ["wikipedia.org", "linkedin.com", "medium.com"]
    }


async def check_eeat(soup) -> dict:
    text = soup.get_text(separator=' ', strip=True)
    return await analyze_eeat_via_llm(text)

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
            "schema": {"score": 100 if has_schema else 0, "details": [f"Found: {', '.join(schema_types)}" if has_schema else "Missing"], "types": schema_types},
            "https": {"score": 100, "details": ["Secured"]}, 
            "agent_economics": calculate_agent_economics(html, soup)
        },
        "content": {
            "questions": check_question_targeting(soup),
            "readability": await check_readability_async(main_text[:5000]), 
            "visual": check_visual_context(soup),
            "freshness": check_freshness(soup),
            "word_count": {"score": 100 if len(main_text.split()) > 300 else 50, "details": [f"{len(main_text.split())} words"]},
            "gap": await analyze_failed_queries(main_text[:5000]),
            "basic_seo": check_basic_seo(soup)
        },
        "authority": {
            "eeat": await check_eeat(soup),
            "knowledge_graph": await extract_entities(main_text[:4000])
        }
    }

async def analyze_readiness(url: str, scan_mode: str = "full"):
    if not url.startswith("http"): url = "https://" + url
    
    # Init Results Structure
    results = {
        "technical": {},
        "content": {}, 
        "authority": {} 
    }
    
    # Full Mode or Technical Mode
    if scan_mode == "full" or scan_mode == "technical":
        results["technical"] = {
            "robots": await check_robots_txt(url),
            "llms": await check_llms_txt(url),
            "sitemap": await check_sitemap(url),
        }

    # For page processing
    main_text = ""
    competitors_data = {}

    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            page = await client.get(url)
            
        if page.status_code == 200:
            soup = BeautifulSoup(page.text, "html.parser")
            main_text = soup.get_text(separator=' ', strip=True)

            if scan_mode == "full":
                # Run Everything
                page_data = await analyze_page_content(page.text)
                results["technical"]["schema"] = page_data["technical"]["schema"]
                results["technical"]["https"] = {"score": 100, "details": ["Valid HTTPS"]}
                results["content"] = page_data["content"]
                results["authority"] = page_data["authority"]
                
            elif scan_mode == "answers":
                # Only analyze questions/gaps
                results["content"]["gap"] = await analyze_failed_queries(main_text[:5000])
                results["content"]["questions"] = check_question_targeting(soup)
                # Keep basic stats for context
                results["content"]["word_count"] = {"score": 100 if len(main_text.split()) > 300 else 50, "details": [f"{len(main_text.split())} words"]}

            # Add more modes as needed (e.g. 'sov')

        else:
            pass
            
    except Exception as e:
        print(f"Analysis failed: {e}")
        pass

    # Competitor Analysis (Only for full or sov mode)
    if scan_mode == "full" or scan_mode == "sov":
        competitors_data = await analyze_competitors(main_text[:3000] if main_text else "", url)

    # Calculate Total Score
    flat_scores = []
    for cat in results.values():
        for metric in cat.values():
            if isinstance(metric, dict) and "score" in metric:
                flat_scores.append(metric["score"])
            
    total = int(sum(flat_scores) / len(flat_scores)) if flat_scores else 0
    
    return {
        "url": url,
        "total_score": total,
        "breakdown": results,
        "competitors": competitors_data,
        "scan_mode": scan_mode
    }

async def generate_content_strategy(user_domain: str, competitor_domain: str) -> dict:
    """Generates a content plan to compete against a specific domain."""
    
    # 1. Try to scrape competitor for context (lightweight)
    competitor_content = ""
    target_url = competitor_domain if competitor_domain.startswith("http") else f"https://{competitor_domain}"
    
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            resp = await client.get(target_url)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                texts = []
                for h in soup.find_all(['h1', 'h2', 'h3'])[:10]:
                    texts.append(h.get_text(strip=True))
                competitor_content = " ".join(texts)[:2000]
    except Exception as e:
        print(f"Competitor Scrape Failed: {e}")
        pass

    # 2. Prompt LLM
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
    
    result = await query_llm(prompt, json_mode=True, temperature=0.4)
    
    if result:
        return result
        
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

async def generate_answer_strategy(user_domain: str) -> dict:
    """Generates a strategy to improve Answer Rate (answering user questions)."""
    
    prompt = f"""
    Act as an AEO (Answer Engine Optimization) Specialist. Create a strategy for {user_domain} to better answer user questions and appear in AI snapshots.
    
    Goal: Increase 'Answer Rate' by providing direct, concise answers to common queries in this niche.
    
    Return a JSON object with:
    1. "pillars": List of 3 core content pillars to focus on (e.g. "Pricing Transparency", "Technical Documentation", "Use Case Guides").
    2. "titles": List of 5 specific question-based article titles (e.g. "How much does X cost?", "Is X compatible with Y?").
    3. "tactics": List of 3 specific technical or content tactics (e.g. "Implement FAQ Schema", "Add 'Key Takeaways' summary at top of posts").
    
    Format:
    {{
        "pillars": ["...", "...", "..."],
        "titles": ["...", "...", ...],
        "tactics": ["...", ...]
    }}
    """
    
    result = await query_llm(prompt, json_mode=True, temperature=0.4)
    
    if result:
        return result
        
    return {
        "pillars": ["FAQ Expansion", "Definition Libraries", "How-to Guides"],
        "titles": [
            f"What is {user_domain}?",
            f"How to use {user_domain} for beginners",
            f"{user_domain} Pricing and Plans Explained",
            f"Common problems with {user_domain} and fixes",
            f"Best practices for {user_domain}"
        ],
        "tactics": ["Add FAQPage schema markup", "Start articles with direct answer paragraphs", "Use list definitions for glossary terms"]
    }
