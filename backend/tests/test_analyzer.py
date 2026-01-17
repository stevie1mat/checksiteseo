import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from bs4 import BeautifulSoup
from analyzer import (
    check_robots_txt,
    check_sitemap,
    check_question_targeting,
    check_basic_seo,
    calculate_agent_economics
)

@pytest.mark.asyncio
async def test_check_robots_txt_allow():
    with patch("analyzer.fetch_page", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = (200, "User-agent: *\nDisallow:")
        result = await check_robots_txt("https://example.com")
        assert result["score"] == 100
        assert result["status"] == "valid"

@pytest.mark.asyncio
async def test_check_robots_txt_block_gpt():
    with patch("analyzer.fetch_page", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = (200, "User-agent: GPTBot\nDisallow: /")
        result = await check_robots_txt("https://example.com")
        assert result["score"] == 0
        assert "Blocked: GPTBot" in result["details"][0]

def test_check_question_targeting():
    html = """
    <html>
        <h2>How do I fix this?</h2>
        <h3>What is the best SEO tool?</h3>
        <h2>Not a question</h2>
    </html>
    """
    soup = BeautifulSoup(html, "html.parser")
    result = check_question_targeting(soup)
    assert result["score"] == 40 # 2 questions * 20
    assert "2/5 Question Headers found" in result["details"][0]

def test_check_basic_seo():
    html = """
    <html>
        <h1>Main Title</h1>
        <meta name="description" content="A good description.">
        <meta property="og:title" content="OG Title">
    </html>
    """
    soup = BeautifulSoup(html, "html.parser")
    result = check_basic_seo(soup)
    assert result["score"] == 100
    assert result["data"]["has_h1"] is True
    assert result["data"]["has_meta_desc"] is True
    assert result["data"]["has_og"] is True

def test_calculate_agent_economics():
    html = "<html><body><p>Hello world this is some content.</p></body></html>"
    # total chars = 63. tokens ~ 15.
    # text = "Hello world this is some content." (31 chars)
    # html_ratio = 31/63 ~ 0.49
    
    soup = BeautifulSoup(html, "html.parser")
    result = calculate_agent_economics(html, soup)
    
    assert result["total_tokens"] > 0
    assert result["html_ratio"] > 0
    assert result["code_bloat_score"] == "Healthy"
