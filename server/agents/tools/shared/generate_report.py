from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
import os
import re
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.3
)

OUTPUTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "outputs")


def ensure_outputs_dir():
    os.makedirs(OUTPUTS_DIR, exist_ok=True)


@tool
def generate_report(report_type: str, title: str, data: str) -> str:
    """
    Generate a structured, professional report and save it as a markdown file.
    Use this to produce any formal document, analysis, or structured output.

    Args:
        report_type: Type of report. Examples:
                     'financial analysis', 'budget report', 'market research',
                     'campaign strategy', 'content calendar', 'product roadmap',
                     'user stories', 'process SOP', 'pipeline report',
                     'risk assessment', 'contract summary', 'compliance checklist'
        title: The title of the report
        data: The raw data, findings, or information to include in the report

    Returns:
        A string containing FILE:<filename> so the executor can log the file,
        followed by a preview of the report content.
    """
    try:
        ensure_outputs_dir()

        prompt = f"""Create a professional {report_type} with the title: "{title}"

Data/Information to include:
{data}

Requirements:
- Use proper markdown formatting with headers, sections, and structure
- Be comprehensive but concise
- Include an executive summary at the top
- Use bullet points, tables, or numbered lists where appropriate
- End with clear next steps or recommendations
- Make it ready to present to stakeholders

Write the full report now:"""

        response = llm.invoke([
            SystemMessage(content="You are an expert business analyst and report writer. Create professional, well-structured reports."),
            HumanMessage(content=prompt)
        ])

        report_content = response.content

        # Save to file
        safe_title = re.sub(r'[^a-zA-Z0-9_]', '_', title.lower())[:40]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{safe_title}_{timestamp}.docx"
        filepath = os.path.join(OUTPUTS_DIR, filename)

        import docx

        doc = docx.Document()
        doc.add_heading(title, 0)
        
        doc.add_paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y at %H:%M')}")
        
        for line in report_content.split('\n'):
            line_stripped = line.strip()
            if not line_stripped:
                continue
            if line_stripped.startswith('# '):
                doc.add_heading(line_stripped[2:], level=1)
            elif line_stripped.startswith('## '):
                doc.add_heading(line_stripped[3:], level=2)
            elif line_stripped.startswith('### '):
                doc.add_heading(line_stripped[4:], level=3)
            elif line_stripped.startswith('- ') or line_stripped.startswith('* '):
                doc.add_paragraph(line_stripped[2:], style='List Bullet')
            else:
                doc.add_paragraph(line_stripped)

        doc.save(filepath)

        # IMPORTANT: Return FILE:<filename> so task_executor can detect and log it
        return f"FILE:{filename}\n\n✅ Report '{title}' saved successfully.\n\n**Preview:**\n{report_content[:600]}..."

    except Exception as e:
        return f"Report generation failed: {str(e)}"