from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
import os
from dotenv import load_dotenv
from typing import AsyncGenerator

load_dotenv()

llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=os.getenv("GROQ_API_KEY"), temperature=0.6)


async def stream_meeting(topic: str, agents: list, session_id: str) -> AsyncGenerator[dict, None]:
    """
    Streams agent responses one by one for the meeting room.
    Each agent sees the topic + all previous responses.
    """
    conversation_history = []

    for agent in agents[:5]:  # cap at 5 agents per meeting
        prior = "\n".join([
            f"{m['agent_name']}: {m['content']}"
            for m in conversation_history
        ])

        prompt = f"""Meeting Topic: {topic}

{"Previous responses:\n" + prior if prior else "You are opening the discussion."}

As the {agent['role']} specialist, share your perspective in 2-3 sentences. Be direct and domain-specific."""

        response = llm.invoke([
            SystemMessage(content=agent.get("persona") or f"You are {agent['name']}, a {agent['role']} specialist in a business team meeting. Be concise."),
            HumanMessage(content=prompt)
        ])

        message = {
            "agent_id": agent["id"],
            "agent_name": agent["name"],
            "agent_role": agent["role"],
            "agent_icon": agent["icon"],
            "agent_color": agent["color"],
            "content": response.content,
            "session_id": session_id,
            "type": "message",
        }

        conversation_history.append(message)
        yield message

    # Final summary
    full_discussion = "\n".join([
        f"{m['agent_name']} ({m['agent_role']}): {m['content']}"
        for m in conversation_history
    ])

    summary_response = llm.invoke([
        SystemMessage(content="You are a meeting facilitator. Summarize the team discussion into key decisions and next steps."),
        HumanMessage(content=f"""Topic: {topic}

Discussion:
{full_discussion}

Provide a concise summary with: 1) Key decisions, 2) Action items, 3) Next steps.""")
    ])

    yield {
        "agent_id": None,
        "agent_name": "Syntra",
        "agent_role": "Facilitator",
        "agent_icon": "⚡",
        "agent_color": "#6d28d9",
        "content": summary_response.content,
        "session_id": session_id,
        "type": "summary",
    }