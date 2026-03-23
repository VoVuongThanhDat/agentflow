import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useCostTracker } from '../../hooks/useCostTracker';
import { AGENT_COLORS, AGENT_NAMES } from '../../lib/constants';
import type { AgentId } from '../../types';

const ALL_AGENTS: AgentId[] = ['ba', 'dev-lead', 'dev-be', 'dev-fe', 'tester', 'devops'];

function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`;
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return iso;
  }
}

export function CostPanel() {
  const { costs, totalCost, timeSeries } = useCostTracker();

  const chartData = timeSeries.map((point) => ({
    time: formatTimestamp(point.timestamp),
    cost: point.totalCost,
  }));

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      {/* Total cost header */}
      <div className="text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Session Cost</p>
        <p className="text-3xl font-bold text-white">
          {totalCost === 0 ? '$0.00' : formatCost(totalCost)}
        </p>
      </div>

      {/* Per-agent breakdown table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="text-left px-3 py-2 font-medium">Agent</th>
              <th className="text-right px-3 py-2 font-medium">Input</th>
              <th className="text-right px-3 py-2 font-medium">Output</th>
              <th className="text-right px-3 py-2 font-medium">Cost</th>
            </tr>
          </thead>
          <tbody>
            {ALL_AGENTS.map((agentId) => {
              const entry = costs[agentId];
              const color = AGENT_COLORS[agentId];
              const name = AGENT_NAMES[agentId];
              return (
                <tr key={agentId} className="border-b border-gray-700 last:border-0">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-gray-200">{name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right text-gray-300">
                    {entry.tokens.input_tokens.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-300">
                    {entry.tokens.output_tokens.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-200 font-mono">
                    {formatCost(entry.cost)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cumulative cost line chart */}
      <div className="bg-gray-800 rounded-lg p-3">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Cumulative Cost</p>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
            $0.00
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `$${v.toFixed(3)}`}
                width={55}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 6 }}
                labelStyle={{ color: '#9CA3AF', fontSize: 11 }}
                itemStyle={{ color: '#E5E7EB', fontSize: 12 }}
                formatter={(value: number) => [formatCost(value), 'Cost']}
              />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#6366F1"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#6366F1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
