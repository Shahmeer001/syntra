from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.7
)


@tool
def write_content(content_type: str, topic: str, context: str = "") -> str:
    """
    Generate professional written content using AI.
    Use this to create any written deliverable for the task.

    Args:
        content_type: Type of content to write. Examples:
                      'blog post', 'email', 'cold outreach', 'sales script',
                      'social media post', 'user story', 'PRD', 'SOP',
                      'process document', 'checklist', 'pitch deck content',
                      'follow-up email', 'campaign copy', 'ad copy'
        topic: The main subject or focus of the content
        context: Additional context, requirements, or constraints

    Returns:
        The fully written content as a string
    """
    try:
        prompt = f"""Write a professional {content_type} about: {topic}

{"Additional context: " + context if context else ""}

Requirements:
- Be specific, actionable, and professional
- Use proper structure and formatting
- Make it ready to use immediately
- Do not add any preamble like "Here is your content"

Write the {content_type} now:"""

        response = llm.invoke([
            SystemMessage(content="You are an expert content writer. Write high-quality, professional content that is ready to use immediately."),
            HumanMessage(content=prompt)
        ])

        return response.content

    except Exception as e:
        return f"Content generation failed: {str(e)}"