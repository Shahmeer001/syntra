from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from typing import TypedDict, List, Optional
import json
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=os.getenv("GROQ_API_KEY"), temperature=0.3)


class TaskState(TypedDict):
    title: str
    description: str
    agent_role: str
    agent_persona: Optional[str]
    reasoning: Optional[str]
    priority: Optional[str]
    subtasks: Optional[List[dict]]
    thoughts: Optional[List[str]]
    status: Optional[str]


def analyze(state: TaskState) -> TaskState:
    thoughts = state.get("thoughts", [])
    thoughts.append("🔍 Analyzing task scope and requirements...")

    persona = state.get("agent_persona") or f"You are a {state['agent_role']} specialist."

    response = llm.invoke([
        SystemMessage(content=persona),
        HumanMessage(content=f"""Analyze this task as a {state['agent_role']} specialist:
Title: {state['title']}
Description: {state['description']}

Write 2-3 sentences covering: what this requires, its complexity, and key challenges. Plain text only.""")
    ])

    thoughts.append(f"💭 {response.content[:120]}...")
    return {**state, "reasoning": response.content, "thoughts": thoughts}


def prioritize(state: TaskState) -> TaskState:
    thoughts = state.get("thoughts", [])
    thoughts.append("⚖️ Assessing priority level...")

    response = llm.invoke([
        SystemMessage(content="You are a priority assessment engine. Respond ONLY with valid JSON, no markdown."),
        HumanMessage(content=f"""Task: {state['title']}
Analysis: {state['reasoning']}

Respond with ONLY this JSON:
{{"priority": "High" or "Medium" or "Low", "reason": "one sentence"}}""")
    ])

    try:
        data = json.loads(response.content.strip().replace("```json", "").replace("```", ""))
        priority = data.get("priority", "Medium")
        thoughts.append(f"🎯 Priority: {priority} — {data.get('reason', '')}")
    except Exception:
        priority = "Medium"
        thoughts.append("🎯 Priority defaulted to Medium")

    return {**state, "priority": priority, "thoughts": thoughts}


def decompose(state: TaskState) -> TaskState:
    thoughts = state.get("thoughts", [])
    thoughts.append("🔨 Breaking into actionable subtasks...")

    response = llm.invoke([
        SystemMessage(content="You are a task decomposition engine. Respond ONLY with a valid JSON array, no markdown."),
        HumanMessage(content=f"""Task: {state['title']}
Description: {state['description']}
Role: {state['agent_role']}
Priority: {state['priority']}

Return ONLY a JSON array of 3-5 subtasks:
[{{"id": 1, "title": "...", "description": "...", "estimated_time": "...", "order": 1}}]""")
    ])

    try:
        subtasks = json.loads(response.content.strip().replace("```json", "").replace("```", ""))
        thoughts.append(f"✅ Generated {len(subtasks)} subtasks")
    except Exception:
        subtasks = [
            {"id": 1, "title": "Plan approach", "description": "Define steps and requirements", "estimated_time": "15 min", "order": 1},
            {"id": 2, "title": "Execute", "description": "Carry out the primary work", "estimated_time": "1 hr", "order": 2},
            {"id": 3, "title": "Review", "description": "Check quality and completeness", "estimated_time": "20 min", "order": 3},
        ]
        thoughts.append("✅ Generated default subtasks")

    return {**state, "subtasks": subtasks, "thoughts": thoughts}


def finalize(state: TaskState) -> TaskState:
    thoughts = state.get("thoughts", [])
    thoughts.append("🎉 Task processed and ready for execution.")
    return {**state, "status": "processed", "thoughts": thoughts}


def build_graph():
    g = StateGraph(TaskState)
    g.add_node("analyze", analyze)
    g.add_node("prioritize", prioritize)
    g.add_node("decompose", decompose)
    g.add_node("finalize", finalize)
    g.set_entry_point("analyze")
    g.add_edge("analyze", "prioritize")
    g.add_edge("prioritize", "decompose")
    g.add_edge("decompose", "finalize")
    g.add_edge("finalize", END)
    return g.compile()


_graph = build_graph()


def run_task_agent(title: str, description: str, agent_persona: str = None, agent_role: str = "General") -> dict:
    result = _graph.invoke({
        "title": title,
        "description": description,
        "agent_role": agent_role,
        "agent_persona": agent_persona,
        "reasoning": None,
        "priority": None,
        "subtasks": None,
        "thoughts": ["🚀 Syntra agent initialized..."],
        "status": "pending",
    })
    return {
        "priority": result["priority"],
        "reasoning": result["reasoning"],
        "subtasks": result["subtasks"],
        "thoughts": result["thoughts"],
        "status": result["status"],
    }