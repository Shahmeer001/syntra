from .shared.search_web import web_search_tool
from .shared.write_content import write_content
from .shared.generate_report import generate_report
from .shared.analyze_numbers import analyze_numbers
from .shared.generate_spreadsheet import generate_spreadsheet
from .specialized.analyze_audience import analyze_audience
from .specialized.read_document import read_document

# Tool registry — maps agent role to its allowed tools
AGENT_TOOLS = {
    "Finance":    [web_search_tool, analyze_numbers, generate_report, generate_spreadsheet],
    "Marketing":  [web_search_tool, write_content, generate_report, analyze_audience],
    "Product":    [web_search_tool, write_content, generate_report],
    "Operations": [write_content, analyze_numbers, generate_report, generate_spreadsheet],
    "Sales":      [web_search_tool, write_content, generate_report],
    "Legal":      [read_document, generate_report],
}

def get_tools_for_role(role: str) -> list:
    """Return the list of tools assigned to a given agent role."""
    return AGENT_TOOLS.get(role, [generate_report])