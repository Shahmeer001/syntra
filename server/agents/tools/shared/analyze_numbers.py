from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.2
)


@tool
def analyze_numbers(data: str, analysis_type: str, context: str = "") -> str:
    """
    Analyze financial or operational data and return structured insights.
    Use this for any task involving numbers, metrics, budgets, or performance data.

    Args:
        data: The raw data to analyze. Can be numbers, percentages,
              financial figures, metrics, or any quantitative information
        analysis_type: What kind of analysis to perform. Examples:
                       'budget analysis', 'revenue projection', 'cost breakdown',
                       'profit & loss', 'cash flow analysis', 'ROI calculation',
                       'efficiency metrics', 'bottleneck analysis',
                       'performance benchmarking', 'variance analysis'
        context: Additional business context to inform the analysis

    Returns:
        A structured analysis with insights, risks, and recommendations
    """
    try:
        prompt = f"""Perform a {analysis_type} on the following data:

Data:
{data}

{"Business Context: " + context if context else ""}

Provide:
1. **Key Findings** — What the numbers tell us
2. **Risks & Red Flags** — What to watch out for
3. **Opportunities** — Where to improve or capitalize
4. **Recommendations** — Specific, actionable next steps
5. **Summary** — One paragraph executive summary

Be precise, data-driven, and actionable. Do not add filler content."""

        response = llm.invoke([
            SystemMessage(content="You are an expert data analyst with deep expertise in financial and operational analysis. Be precise, insightful, and actionable."),
            HumanMessage(content=prompt)
        ])

        return response.content

    except Exception as e:
        return f"Analysis failed: {str(e)}"