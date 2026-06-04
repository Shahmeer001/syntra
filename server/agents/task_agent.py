"""
task_agent.py - Updated ReAct agent with role-specific tool execution.
Switches from a linear chain to a tool-calling loop.
"""

from langgraph.prebuilt import create_react_agent
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from typing import Optional
import os
from dotenv import load_dotenv
from agents.tools import get_tools_for_role

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.3
)


def run_task_agent(
    title: str,
    description: str,
    agent_persona: Optional[str] = None,
    agent_role: str = "General"
) -> dict:
    """
    Run the ReAct agent for a given task using role-specific tools.

    Flow:
    1. Get tools assigned to this agent's role
    2. Create a ReAct agent with those tools
    3. Agent decides which tools to call and in what order
    4. Collect all tool outputs and thoughts
    5. Return structured result

    Args:
        title: Task title
        description: Task description
        agent_persona: Agent's system persona
        agent_role: Role (Finance, Marketing, Product, Operations, Sales, Legal)

    Returns:
        Dict with priority, reasoning, subtasks, thoughts, status, tool_outputs
    """

    # === Get role-specific tools ===
    tools = get_tools_for_role(agent_role)
    tool_names = [t.name for t in tools]

    # === Build system prompt ===
    persona = agent_persona or f"You are a {agent_role} specialist with deep domain expertise."

    system_prompt = f"""{persona}

You have access to the following tools: {', '.join(tool_names)}

Your job is to EXECUTE the task fully using your available tools. Do not just plan — actually do the work.

Guidelines:
- Use tools in a logical order to complete the task
- Use web_search_tool first if you need current information
- Use write_content to produce any written deliverables
- Use generate_report to produce structured documents
- Use analyze_numbers when working with data or metrics
- Use analyze_audience when defining target markets (Marketing only)
- Use read_document when analyzing contracts or legal text (Legal only)
- After using tools, summarize what was accomplished

Always complete the task fully. Do not stop halfway."""

    # === Create ReAct agent ===
    agent = create_react_agent(llm, tools)

    # === Build task message ===
    task_message = f"""Execute this task completely:

Title: {title}
Description: {description}

Use your available tools to fully complete this task. Produce real, usable output."""

    thoughts = [f"🚀 {agent_role} Agent initialized with tools: {', '.join(tool_names)}"]
    tool_outputs = []
    priority = "Medium"
    subtasks = []

    try:
        # === Run the agent ===
        thoughts.append("🧠 Analyzing task and selecting tools...")

        result = agent.invoke({
            "messages": [
                SystemMessage(content=system_prompt),
                HumanMessage(content=task_message)
            ]
        })

        # === Extract messages and tool calls ===
        messages = result.get("messages", [])

        for msg in messages:
            msg_type = type(msg).__name__

            # Tool call messages
            if msg_type == "AIMessage" and hasattr(msg, "tool_calls") and msg.tool_calls:
                for tc in msg.tool_calls:
                    tool_name = tc.get("name", "unknown")
                    thoughts.append(f"🔧 Calling tool: {tool_name}")

            # Tool result messages
            if msg_type == "ToolMessage":
                tool_outputs.append({
                    "tool": msg.name if hasattr(msg, "name") else "tool",
                    "output": msg.content
                })
                thoughts.append(f"✅ Tool completed: {msg.name if hasattr(msg, 'name') else 'tool'}")

        # === Get final response ===
        final_message = ""
        for msg in reversed(messages):
            if type(msg).__name__ == "AIMessage" and msg.content:
                final_message = msg.content
                break

        thoughts.append("🎉 Task execution completed")

        # === Assess priority based on task ===
        priority = _assess_priority(title, description)

        # === Build subtasks from tool outputs ===
        subtasks = _build_subtasks_from_outputs(tool_outputs, tool_names)

        return {
            "priority": priority,
            "reasoning": final_message,
            "subtasks": subtasks,
            "thoughts": thoughts,
            "status": "done",
            "tool_outputs": tool_outputs,
        }

    except Exception as e:
        thoughts.append(f"❌ Execution error: {str(e)}")
        return {
            "priority": "Medium",
            "reasoning": f"Task execution encountered an error: {str(e)}",
            "subtasks": [],
            "thoughts": thoughts,
            "status": "error",
            "tool_outputs": tool_outputs,
        }


def _assess_priority(title: str, description: str) -> str:
    """Quick priority assessment based on keywords."""
    text = (title + " " + description).lower()
    high_keywords = ["urgent", "critical", "asap", "immediately", "deadline", "crisis", "emergency"]
    low_keywords = ["low priority", "when possible", "sometime", "optional", "nice to have"]

    if any(k in text for k in high_keywords):
        return "High"
    if any(k in text for k in low_keywords):
        return "Low"
    return "Medium"


def _build_subtasks_from_outputs(tool_outputs: list, tool_names: list) -> list:
    """Convert tool outputs into subtask list for UI display."""
    subtasks = []
    for i, output in enumerate(tool_outputs, 1):
        subtasks.append({
            "id": i,
            "title": f"Step {i}: {output['tool'].replace('_', ' ').title()}",
            "description": output["output"][:200] + "..." if len(output["output"]) > 200 else output["output"],
            "estimated_time": "Completed",
            "order": i,
            "status": "done"
        })
    return subtasks