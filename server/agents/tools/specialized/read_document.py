from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.1
)


@tool
def read_document(document_text: str, document_type: str = "contract") -> str:
    """
    Read and analyze a legal document, contract, or policy.
    Extracts key clauses, flags risks, and provides a structured summary.
    ONLY available to the Legal Agent.

    Args:
        document_text: The full text content of the document to analyze.
                       Paste the document text directly here.
        document_type: Type of document. Examples:
                       'contract', 'NDA', 'terms of service', 'privacy policy',
                       'employment agreement', 'partnership agreement',
                       'SLA', 'vendor agreement', 'lease agreement'

    Returns:
        A structured legal analysis with key clauses, risks, and recommendations
    """
    try:
        prompt = f"""Analyze this {document_type} as a senior corporate lawyer:

DOCUMENT:
{document_text}

Provide a comprehensive legal analysis:

## 1. Document Overview
- Type of document
- Parties involved
- Effective date and duration

## 2. Key Clauses
- List and explain the most important clauses
- Highlight unusual or non-standard terms

## 3. Rights & Obligations
- What each party is entitled to
- What each party is required to do

## 4. Risk Flags 🚨
- Identify clauses that are risky or unfavorable
- Rate each risk: High / Medium / Low
- Explain why each is a concern

## 5. Missing Clauses
- What standard protections are absent?
- What should be added before signing?

## 6. Compliance Issues
- Any regulatory or legal compliance concerns

## 7. Recommendations
- Should this be signed as-is?
- What to negotiate or request changes on?
- Suggested modifications

## 8. Plain English Summary
- Explain the document in simple terms
- What does signing this actually mean?

Be precise and conservative. Flag everything that could be a concern."""

        response = llm.invoke([
            SystemMessage(content="You are a senior corporate lawyer with 20 years of experience reviewing contracts. Be thorough, precise, and conservative in your risk assessment. Always protect the client's interests."),
            HumanMessage(content=prompt)
        ])

        return response.content

    except Exception as e:
        return f"Document analysis failed: {str(e)}"