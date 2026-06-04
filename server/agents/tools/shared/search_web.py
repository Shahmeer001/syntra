from langchain_core.tools import tool
import urllib.request
import urllib.parse
import json


@tool
def web_search_tool(query: str) -> str:
    """
    Search the web using DuckDuckGo (free, no API key needed).
    Use this to research market trends, competitors, industry data,
    prospect information, or any real-world information needed for the task.

    Args:
        query: The search query string

    Returns:
        A formatted string of search results with titles, snippets, and URLs
    """
    try:
        encoded_query = urllib.parse.quote(query)
        url = f"https://api.duckduckgo.com/?q={encoded_query}&format=json&no_html=1&skip_disambig=1"

        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())

        results = []

        # Abstract (main result)
        if data.get("Abstract"):
            results.append(f"📌 Summary: {data['Abstract']}")
            if data.get("AbstractURL"):
                results.append(f"   Source: {data['AbstractURL']}")

        # Related topics
        topics = data.get("RelatedTopics", [])[:5]
        for topic in topics:
            if isinstance(topic, dict) and topic.get("Text"):
                results.append(f"\n🔗 {topic['Text']}")
                if topic.get("FirstURL"):
                    results.append(f"   URL: {topic['FirstURL']}")

        if not results:
            return f"No results found for: {query}. Try a more specific search query."

        return "\n".join(results)

    except Exception as e:
        return f"Search failed for '{query}': {str(e)}. Try rephrasing the query."