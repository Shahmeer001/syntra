from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from typing import TypedDict, List
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=os.getenv("GROQ_API_KEY"), temperature=0.5)


def run_collaboration(task: dict, agents: list) -> dict:
    """
    Sequential multi-agent collaboration:
    Each agent reads the task + previous responses and adds their perspective.
    Final agent produces a unified summary.
    """
    title = task["title"]
    description = task.get("description", "")
    messages = []

    # Each agent responds in sequence, seeing prior responses
    for i, agent in enumerate(agents[:4]):  # cap at 4 agents
        prior = "\n".join([
            f"{m['agent_name']}: {m['content']}" for m in messages
        ])

        prompt = f"""Task: {title}
Description: {description}

{"Prior team input:\n" + prior if prior else "You are the first to respond."}

As the {agent['role']} specialist, provide your focused perspective on this task in 2-3 sentences. Be specific to your domain."""

        response = llm.invoke([
            SystemMessage(content=agent.get("persona") or f"You are a {agent['role']} specialist. Be concise and domain-specific."),
            HumanMessage(content=prompt)
        ])

        messages.append({
            "agent_id": agent["id"],
            "agent_name": agent["name"],
            "agent_role": agent["role"],
            "agent_icon": agent["icon"],
            "agent_color": agent["color"],
            "content": response.content,
        })

    # Final synthesizer
    full_thread = "\n".join([f"{m['agent_name']} ({m['agent_role']}): {m['content']}" for m in messages])
    summary_response = llm.invoke([
        SystemMessage(content="You are a synthesis engine. Summarize team input into a clear, actionable plan."),
        HumanMessage(content=f"""Task: {title}

Team discussion:
{full_thread}

Write a 3-4 sentence unified action plan that integrates all perspectives.""")
    ])

    return {
        "messages": messages,
        "summary": summary_response.content,
    }