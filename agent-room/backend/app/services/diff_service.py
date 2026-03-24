"""
DiffService — captures file changes from tool-use events (Write/Edit tools).

Generates unified diffs using Python's difflib, stores them in-memory per
session, and publishes diff_event notifications via the EventBus.
"""

import difflib
import uuid
from datetime import datetime

from app.core.event_bus import EventBus


class DiffService:
    """Captures and stores file diffs when agents use Write or Edit tools."""

    def __init__(self, event_bus: EventBus) -> None:
        self._event_bus = event_bus
        # _diffs: {session_id: list[DiffEntry]}
        self._diffs: dict[str, list] = {}

    async def handle_tool_use(
        self,
        session_id: str,
        agent_id: str,
        tool_name: str,
        tool_input: dict,
    ) -> None:
        """
        Process a tool-use event and generate a diff entry if applicable.

        For Write tools: diffs empty -> new content (treats the file as new).
        For Edit tools: diffs old_string -> new_string.
        All other tool names are silently ignored.

        Args:
            session_id: The session identifier for storing and publishing.
            agent_id: The agent that invoked the tool.
            tool_name: Name of the tool (e.g. 'Write', 'Edit').
            tool_input: The tool input dict as received from the CLI bridge.
        """
        if tool_name == "Write":
            file_path = tool_input.get("file_path", "?")
            new_content = tool_input.get("content", "")
            diff_lines = list(
                difflib.unified_diff(
                    [],
                    new_content.splitlines(keepends=True),
                    fromfile=f"{file_path} (before)",
                    tofile=f"{file_path} (after)",
                )
            )
            diff_str = "".join(diff_lines) or new_content[:500] + "..."

        elif tool_name == "Edit":
            file_path = tool_input.get("file_path", "?")
            old_str = tool_input.get("old_string", "")
            new_str = tool_input.get("new_string", "")
            diff_lines = list(
                difflib.unified_diff(
                    old_str.splitlines(keepends=True),
                    new_str.splitlines(keepends=True),
                    fromfile=f"{file_path} (before)",
                    tofile=f"{file_path} (after)",
                )
            )
            diff_str = "".join(diff_lines)

        else:
            return  # Not a file change tool — silently ignored

        entry = {
            "id": str(uuid.uuid4()),
            "agent": agent_id,
            "file": file_path,
            "diff": diff_str,
            "timestamp": datetime.utcnow().isoformat(),
        }
        self._diffs.setdefault(session_id, []).append(entry)

        await self._event_bus.publish(
            session_id,
            {
                "type": "diff_event",
                "agent": agent_id,
                "file": file_path,
                "diff": diff_str,
            },
        )

    def get_diffs(self, session_id: str) -> list:
        """
        Return all diff entries for a session, newest first.

        Args:
            session_id: The session identifier to look up.

        Returns:
            List of DiffEntry dicts in reverse-chronological order.
        """
        return list(reversed(self._diffs.get(session_id, [])))
