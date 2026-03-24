import asyncio
import json
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class BeadsClient:
    def __init__(self, specs_dir: str):
        self._specs_dir = specs_dir  # ALLY_SPECS_DIR from config

    async def _run_bd(self, args: list[str]) -> str:
        """Run a bd command in the specs directory and return stdout as a string."""
        try:
            proc = await asyncio.create_subprocess_exec(
                "bd",
                *args,
                cwd=self._specs_dir,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await proc.communicate()
            if proc.returncode != 0:
                logger.warning(
                    "bd %s exited with code %d: %s",
                    " ".join(args),
                    proc.returncode,
                    stderr.decode(errors="replace").strip(),
                )
                return ""
            return stdout.decode(errors="replace")
        except Exception as exc:
            logger.warning("bd %s failed: %s", " ".join(args), exc)
            return ""

    async def list_tasks(self) -> list[dict]:
        """Return all tasks as a list of dicts (bd list --json)."""
        output = await self._run_bd(["list", "--json"])
        if not output.strip():
            return []
        try:
            result = json.loads(output)
            if isinstance(result, list):
                return result
            logger.warning("bd list --json returned unexpected type: %s", type(result))
            return []
        except json.JSONDecodeError as exc:
            logger.warning("Failed to parse bd list --json output: %s", exc)
            return []

    async def get_task(self, task_id: str) -> dict:
        """Return a single task dict (bd show <id> --json or text fallback)."""
        output = await self._run_bd(["show", task_id, "--json"])
        if not output.strip():
            # Fallback: try without --json and return raw text in a dict
            output = await self._run_bd(["show", task_id])
            if not output.strip():
                return {}
            return {"id": task_id, "raw": output.strip()}
        try:
            result = json.loads(output)
            if isinstance(result, dict):
                return result
            logger.warning("bd show --json returned unexpected type: %s", type(result))
            return {}
        except json.JSONDecodeError as exc:
            logger.warning("Failed to parse bd show --json output: %s", exc)
            return {"id": task_id, "raw": output.strip()}

    async def get_ready_tasks(self) -> list[dict]:
        """Return tasks with no blockers (bd ready --json or text fallback)."""
        output = await self._run_bd(["ready", "--json"])
        if not output.strip():
            # Fallback: try without --json
            output = await self._run_bd(["ready"])
            if not output.strip():
                return []
            # Best-effort: return raw text lines as dicts
            return [{"raw": line.strip()} for line in output.splitlines() if line.strip()]
        try:
            result = json.loads(output)
            if isinstance(result, list):
                return result
            logger.warning("bd ready --json returned unexpected type: %s", type(result))
            return []
        except json.JSONDecodeError as exc:
            logger.warning("Failed to parse bd ready --json output: %s", exc)
            return [{"raw": line.strip()} for line in output.splitlines() if line.strip()]

    async def get_graph(self) -> dict:
        """Return dependency graph (bd graph --all --json or text fallback)."""
        output = await self._run_bd(["graph", "--all", "--json"])
        if not output.strip():
            # Fallback: try without --json
            output = await self._run_bd(["graph", "--all"])
            if not output.strip():
                return {}
            return {"raw": output.strip()}
        try:
            result = json.loads(output)
            if isinstance(result, dict):
                return result
            logger.warning("bd graph --json returned unexpected type: %s", type(result))
            return {}
        except json.JSONDecodeError as exc:
            logger.warning("Failed to parse bd graph --json output: %s", exc)
            return {"raw": output.strip()}


# Module-level singleton using ALLY_SPECS_DIR from settings
beads_client = BeadsClient(specs_dir=settings.ALLY_SPECS_DIR)
