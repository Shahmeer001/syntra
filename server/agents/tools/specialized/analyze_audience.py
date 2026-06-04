from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.5
)


@tool
def analyze_audience(product_or_service: str, context: str = "") -> str:
    """
    Analyze and define the target audience for a product or service.
    Use this to understand who to market to, how to message them,
    and which channels to use. ONLY available to the Marketing Agent.

    Args:
        product_or_service: Description of the product or service being marketed
        context: Additional context such as existing customer data,
                 industry, price point, or geographic focus

    Returns:
        A detailed audience analysis with personas, messaging, and channel recommendations
    """
    try:
        prompt = f"""Perform a comprehensive target audience analysis for:

Product/Service: {product_or_service}
{"Context: " + context if context else ""}

Provide a detailed breakdown covering:

## 1. Primary Audience Personas
- Create 2-3 detailed buyer personas
- Include: age, role, goals, pain points, buying triggers

## 2. Secondary Audiences
- Who else might buy this and why

## 3. Pain Points & Motivations
- What problems are they trying to solve?
- What motivates their purchase decision?

## 4. Messaging Angles
- What key messages will resonate most?
- What language and tone to use?
- What to avoid saying?

## 5. Best Marketing Channels
- Where does this audience spend time?
- Which channels will convert best?
- Organic vs paid recommendations

## 6. Competitive Positioning
- How to differentiate from competitors in messaging

## 7. Content Strategy
- What type of content attracts this audience?
- Topics, formats, and frequency

Be specific and actionable. Avoid generic advice."""

        response = llm.invoke([
            SystemMessage(content="You are a world-class CMO and audience research specialist. Provide deep, specific, and actionable audience insights."),
            HumanMessage(content=prompt)
        ])

        return response.content

    except Exception as e:
        return f"Audience analysis failed: {str(e)}"