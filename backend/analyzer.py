import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re

async def check_robots_txt(base_url: str) -> dict:
    robots_url = urljoin(base_url, "/robots.txt")
    score = 0
    details = []
    
    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            response = await client.get(robots_url)
            
        if response.status_code == 200:
            content = response.text
            # Simple check for AI bots
            bots = ["GPTBot", "ClaudeBot", "CCBot"]
            blocked = []
            allowed = []
            
            for bot in bots:
                # Very basic check: User-agent: Bot ... Disallow: /
                # A robust parser is complex, but for this audit we look for simple blocks.
                # If we find "User-agent: Bot" followed generally by "Disallow: /" check constraints.
                # For this MVP, we define "blocked" if "Disallow: /" (root) implies for that bot.
                # However, strict parsing is best. Let's do a heuristic:
                # If "User-agent: *Bot*" appears.
                if re.search(f"User-agent:\\s*{bot}", content, re.IGNORECASE):
                    # Check if next lines are Disallow: /
                    # Simplified: if bot is mentioned, we assume it's being managed.
                    # We check if it's explicitly disallowed from root.
                     if re.search(f"User-agent:\\s*{bot}.*?Disallow:\\s*/\\s*(\\n|$)", content, re.IGNORECASE | re.DOTALL):
                         blocked.append(bot)
                     else:
                         allowed.append(bot)
                else:
                    # If not mentioned, usually allowed, but check generic User-agent: *
                    allowed.append(bot) # Default allow

            if not blocked:
                score = 25
                details.append("No AI bots matching (GPTBot, ClaudeBot, CCBot) are explicitly blocked from root.")
            else:
                score = 0
                details.append(f"Blocked bots detected: {', '.join(blocked)}")
        else:
            # If no robots.txt, default allow usually, or error?
            # 404 means allowed.
            score = 25
            details.append("No robots.txt found (Assumed Allowed).")
            
    except Exception as e:
        score = 0
        details.append(f"Error checking robots.txt: {str(e)}")

    return {"score": score, "details": details}

async def check_llms_txt(base_url: str) -> dict:
    llms_url = urljoin(base_url, "/llms.txt")
    score = 0
    details = []
    
    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            response = await client.get(llms_url)
            
        if response.status_code == 200 and len(response.text) > 0:
            score = 20
            details.append("Found /llms.txt file.")
        else:
            score = 0
            details.append("No /llms.txt file found.")
            
    except Exception:
        score = 0
        details.append("Error or not found for /llms.txt")
        
    return {"score": score, "details": details}

def analyze_content_and_schema(html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    
    # Schema Check
    unique_schemas = set()
    schema_score = 0
    schema_details = []
    
    scripts = soup.find_all("script", type="application/ld+json")
    for script in scripts:
        if script.string:
            # Basic string parse check to avoid heavy recursion for MVP
            txt = script.string
            if "FAQPage" in txt: unique_schemas.add("FAQPage")
            if "HowTo" in txt: unique_schemas.add("HowTo")
            if "Organization" in txt: unique_schemas.add("Organization")
    
    if unique_schemas:
        schema_score = 30
        schema_details.append(f"Found schemas: {', '.join(unique_schemas)}")
    else:
        schema_details.append("No target schemas (FAQPage, HowTo, Organization) found.")

    # Content Analysis
    # Get direct answer structure
    # Heuristic: Find first <p> or Main content with 40-60 words.
    
    content_score = 0
    content_details = []
    
    # Try to find main content
    main = soup.find("main") or soup.body
    
    if main:
        paragraphs = main.find_all("p")
        found_concise = False
        for p in paragraphs:
            text = p.get_text(strip=True)
            word_count = len(text.split())
            if 40 <= word_count <= 60:
                found_concise = True
                content_details.append(f"Found ideal structure (40-60 words): '{text[:50]}...'")
                break
        
        if found_concise:
            content_score = 25
        else:
            content_details.append("No concise 40-60 word paragraph found in main content.")
            
    else:
        content_details.append("Could not identify main content.")
    
    return {
        "schema": {"score": schema_score, "details": schema_details},
        "content": {"score": content_score, "details": content_details}
    }

async def analyze_readiness(url: str):
    # Normalize URL
    if not url.startswith("http"):
        url = "https://" + url
    
    tasks = {
        "robots": await check_robots_txt(url),
        "llms": await check_llms_txt(url)
    }
    
    # Fetch page content for other checks
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            page_response = await client.get(url)
            
        if page_response.status_code == 200:
            page_analysis = analyze_content_and_schema(page_response.text)
            tasks.update(page_analysis)
        else:
             tasks["schema"] = {"score": 0, "details": ["Could not fetch page for schema check."]}
             tasks["content"] = {"score": 0, "details": ["Could not fetch page for content check."]}
             
    except Exception as e:
        tasks["schema"] = {"score": 0, "details": [f"Error fetching page: {str(e)}"]}
        tasks["content"] = {"score": 0, "details": [f"Error fetching page: {str(e)}"]}
        
    # Calculate Total
    total = (
        tasks["robots"]["score"] +
        tasks["llms"]["score"] +
        tasks["schema"]["score"] +
        tasks["content"]["score"]
    )
    
    return {
        "url": url,
        "total_score": total,
        "breakdown": tasks
    }
