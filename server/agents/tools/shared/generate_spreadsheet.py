from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
import os
import re
import json
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
def generate_spreadsheet(spreadsheet_type: str, title: str, data: str) -> str:
    """
    Generate a structured spreadsheet and save it as an .xlsx file.
    Use this to produce financial models, data tables, or structured datasets.

    Args:
        spreadsheet_type: Type of spreadsheet (e.g., 'financial model', 'inventory', 'customer list')
        title: The title of the spreadsheet
        data: The raw data or information to convert into rows and columns

    Returns:
        A string containing FILE:<filename> so the executor can log the file,
        followed by a preview of the content.
    """
    try:
        ensure_outputs_dir()
        
        import openpyxl
        from openpyxl.styles import Font
        
        prompt = f"""Convert the following data into a structured format for a {spreadsheet_type} titled "{title}".
Your output MUST be valid JSON containing a single array of objects, where each object represents a row and its keys represent the column headers.

Data to convert:
{data}

Example output format:
[
  {{"Name": "John Doe", "Age": 30, "Role": "Developer"}},
  {{"Name": "Jane Smith", "Age": 28, "Role": "Designer"}}
]

Only return the JSON array, no extra text, markdown formatting, or explanations."""

        response = llm.invoke([
            SystemMessage(content="You are an expert data processor. Return ONLY valid JSON arrays without markdown blocks or backticks."),
            HumanMessage(content=prompt)
        ])
        
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        try:
            json_data = json.loads(content)
        except json.JSONDecodeError as e:
            return f"Failed to parse JSON from LLM response. Error: {str(e)}\nRaw response: {content}"
            
        if not isinstance(json_data, list) or len(json_data) == 0:
            return "LLM returned empty data or invalid format."
            
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Data"
        
        headers = list(json_data[0].keys())
        ws.append(headers)
        
        for col in range(1, len(headers) + 1):
            cell = ws.cell(row=1, column=col)
            cell.font = Font(bold=True)
            
        for row_data in json_data:
            row = [row_data.get(header, "") for header in headers]
            ws.append(row)
            
        for col in ws.columns:
            max_length = 0
            column = col[0].column_letter
            for cell in col:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = (max_length + 2)
            ws.column_dimensions[column].width = adjusted_width
            
        safe_title = re.sub(r'[^a-zA-Z0-9_]', '_', title.lower())[:40]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{safe_title}_{timestamp}.xlsx"
        filepath = os.path.join(OUTPUTS_DIR, filename)
        
        wb.save(filepath)
        
        return f"FILE:{filename}\n\n✅ Spreadsheet '{title}' saved successfully.\n\n**Preview (first 2 rows):**\n{str(json_data[:2])}"

    except Exception as e:
        return f"Spreadsheet generation failed: {str(e)}"
