import asyncio
from datetime import datetime
from typing import Optional
from database import get_supabase
from agents.task_agent import run_task_agent
import logging

logger = logging.getLogger(__name__)


class TaskExecutor:

    def __init__(self):
        self.db = get_supabase()
        self.running_tasks = set()

    async def log_execution(self, task_id, agent_id, log_type, message, execution_data=None):
        try:
            self.db.table("execution_logs").insert({
                "task_id": task_id,
                "agent_id": agent_id,
                "log_type": log_type,
                "message": message,
                "execution_data": execution_data or {},
                "timestamp": datetime.utcnow().isoformat(),
            }).execute()
        except Exception as e:
            logger.error(f"Failed to log execution: {e}")

    async def update_task_status(self, task_id, status, agent_output=None):
        try:
            update_data = {"status": status, "updated_at": "now()"}
            if agent_output:
                update_data["agent_output"] = agent_output
            self.db.table("tasks").update(update_data).eq("id", task_id).execute()
        except Exception as e:
            logger.error(f"Failed to update task status: {e}")

    def extract_files_from_outputs(self, tool_outputs: list) -> list:
        """
        Scan tool outputs for FILE:<filename> markers.
        generate_report.py returns FILE:<filename> so we can detect it here.
        """
        files = []
        for output in tool_outputs:
            content = output.get("output", "")
            if content.startswith("FILE:"):
                # Extract filename from first line
                first_line = content.split("\n")[0]
                filename = first_line.replace("FILE:", "").strip()
                files.append(filename)
        return files

    async def execute_task(self, task_id, title, description, agent_id=None, agent_persona=None, agent_role="General"):
        try:
            if task_id in self.running_tasks:
                return
            self.running_tasks.add(task_id)

            # === Mark in_progress ===
            await self.update_task_status(task_id, "in_progress")
            await self.log_execution(task_id, agent_id, "progress", "🚀 Task execution started", {"phase": "initialization"})
            await self.log_execution(task_id, agent_id, "progress", "🧠 Agent analyzing task and selecting tools...", {"phase": "analysis"})

            # === Run agent ===
            try:
                agent_output = run_task_agent(
                    title=title,
                    description=description,
                    agent_persona=agent_persona,
                    agent_role=agent_role,
                )
            except Exception as e:
                logger.error(f"Agent execution failed: {e}")
                await self.log_execution(task_id, agent_id, "error", f"❌ Agent execution failed: {str(e)}", {"error": str(e)})
                await self.update_task_status(task_id, "done")
                self.running_tasks.discard(task_id)
                return

            # === Log thoughts (tool calls) ===
            thoughts = agent_output.get("thoughts", [])
            for thought in thoughts:
                await self.log_execution(task_id, agent_id, "progress", thought, {})

            # === Log tool outputs ===
            tool_outputs = agent_output.get("tool_outputs", [])
            for output in tool_outputs:
                tool_name = output.get("tool", "tool")
                content = output.get("output", "")

                # Clean preview — remove FILE: prefix for display
                preview = content.replace(f"FILE:{content.split(chr(10))[0].replace('FILE:', '').strip()}", "").strip() if content.startswith("FILE:") else content
                preview = preview[:300] + "..." if len(preview) > 300 else preview

                await self.log_execution(
                    task_id, agent_id, "info",
                    f"🔧 {tool_name.replace('_', ' ').title()} completed",
                    {"tool": tool_name, "preview": preview}
                )

            # === Detect and log generated files ===
            generated_files = self.extract_files_from_outputs(tool_outputs)
            for filename in generated_files:
                await self.log_execution(
                    task_id, agent_id, "success",
                    f"📄 Report generated: {filename}",
                    {
                        "file": filename,
                        "download_url": f"/outputs/{filename}",
                        "type": "file"
                    }
                )

            # === Log priority ===
            priority = agent_output.get("priority", "Medium")
            await self.log_execution(task_id, agent_id, "progress", f"📊 Priority: {priority}", {"priority": priority})

            # === Mark done ===
            await self.update_task_status(task_id, "done", {
                **agent_output,
                "generated_files": generated_files
            })

            await self.log_execution(
                task_id, agent_id, "success",
                "🎉 Task completed successfully",
                {
                    "phase": "completion",
                    "files_generated": len(generated_files),
                    "generated_files": generated_files
                }
            )

            logger.info(f"Task {task_id} completed. Files: {generated_files}")

        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            await self.log_execution(task_id, agent_id, "error", f"⚠️ Unexpected error: {str(e)}", {"error": str(e)})
            await self.update_task_status(task_id, "done")
        finally:
            self.running_tasks.discard(task_id)


_executor = None


def get_executor() -> TaskExecutor:
    global _executor
    if _executor is None:
        _executor = TaskExecutor()
    return _executor


async def execute_task_background(task_id, title, description, agent_id=None, agent_persona=None, agent_role="General"):
    executor = get_executor()
    asyncio.create_task(
        executor.execute_task(
            task_id=task_id,
            title=title,
            description=description,
            agent_id=agent_id,
            agent_persona=agent_persona,
            agent_role=agent_role,
        )
    )