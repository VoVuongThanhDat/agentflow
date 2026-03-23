import { useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { useDiffs } from '../../hooks/useDiffs';
import { AGENT_COLORS, AGENT_NAMES } from '../../lib/constants';
import type { DiffEntry } from '../../types';

// Parse a unified diff string into old (removed) and new (added) content
function parseUnifiedDiff(diff: string): { oldValue: string; newValue: string } {
  const lines = diff.split('\n');
  const oldLines: string[] = [];
  const newLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('@@')) {
      // Skip diff headers
      continue;
    } else if (line.startsWith('-')) {
      oldLines.push(line.slice(1));
    } else if (line.startsWith('+')) {
      newLines.push(line.slice(1));
    } else {
      // Context line (no prefix or space prefix)
      const content = line.startsWith(' ') ? line.slice(1) : line;
      oldLines.push(content);
      newLines.push(content);
    }
  }

  return {
    oldValue: oldLines.join('\n'),
    newValue: newLines.join('\n'),
  };
}

function getRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface DiffEntryRowProps {
  entry: DiffEntry;
}

function DiffEntryRow({ entry }: DiffEntryRowProps) {
  const [expanded, setExpanded] = useState(false);
  const agentColor = AGENT_COLORS[entry.agent];
  const agentName = AGENT_NAMES[entry.agent];
  const relativeTime = getRelativeTime(entry.timestamp);

  const { oldValue, newValue } = expanded ? parseUnifiedDiff(entry.diff) : { oldValue: '', newValue: '' };

  return (
    <div className="border border-gray-700 rounded overflow-hidden">
      {/* Collapsed header */}
      <button
        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-750 text-left cursor-pointer"
        onClick={() => setExpanded((prev) => !prev)}
      >
        {/* Expand indicator */}
        <span className="text-gray-400 text-xs select-none">{expanded ? '▾' : '▸'}</span>

        {/* Agent color dot */}
        <span
          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: agentColor }}
        />

        {/* File path */}
        <span className="font-mono text-xs text-gray-200 truncate flex-1">{entry.file}</span>

        {/* Agent name */}
        <span className="text-xs text-gray-400 flex-shrink-0">{agentName}</span>

        {/* Timestamp */}
        <span className="text-xs text-gray-500 flex-shrink-0">{relativeTime}</span>
      </button>

      {/* Expanded diff */}
      {expanded && (
        <div className="overflow-x-auto text-xs">
          <ReactDiffViewer
            oldValue={oldValue}
            newValue={newValue}
            splitView={false}
            useDarkTheme
            hideLineNumbers={false}
          />
        </div>
      )}
    </div>
  );
}

export function DiffViewer() {
  const { diffs } = useDiffs();

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-100">File Diffs</h2>
        {diffs.length > 0 && (
          <span className="bg-gray-700 text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full">
            {diffs.length}
          </span>
        )}
      </div>

      {/* Diff list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {diffs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm">No file diffs yet</p>
          </div>
        ) : (
          diffs.map((entry) => <DiffEntryRow key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  );
}
