import asyncio
import os
import signal
from dataclasses import dataclass, field
from typing import AsyncIterator


@dataclass
class ProcessHandle:
    process: asyncio.subprocess.Process
    pid: int

    async def write_stdin(self, data: str) -> None:
        if self.process.stdin is None:
            raise RuntimeError("Process stdin is not available")
        self.process.stdin.write((data + "\n").encode())
        await self.process.stdin.drain()

    async def read_stdout(self) -> AsyncIterator[str]:
        if self.process.stdout is None:
            return
        while True:
            line = await self.process.stdout.readline()
            if not line:
                break
            yield line.decode().rstrip("\n")

    def is_alive(self) -> bool:
        return self.process.returncode is None


class ProcessPool:
    def __init__(self):
        self._handles: list[ProcessHandle] = []

    async def spawn(self, cmd: list[str], env: dict | None = None, cwd: str | None = None) -> ProcessHandle:
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
            cwd=cwd,
        )
        handle = ProcessHandle(process=process, pid=process.pid)
        self._handles.append(handle)
        return handle

    async def terminate(self, handle: ProcessHandle) -> None:
        if handle.is_alive():
            try:
                handle.process.send_signal(signal.SIGTERM)
            except ProcessLookupError:
                pass
            try:
                await asyncio.wait_for(handle.process.wait(), timeout=5.0)
            except asyncio.TimeoutError:
                if handle.is_alive():
                    try:
                        handle.process.send_signal(signal.SIGKILL)
                    except ProcessLookupError:
                        pass
                    await handle.process.wait()
        if handle in self._handles:
            self._handles.remove(handle)

    async def terminate_all(self) -> None:
        handles = list(self._handles)
        await asyncio.gather(*(self.terminate(h) for h in handles))
