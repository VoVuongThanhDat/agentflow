import { Home, LayoutDashboard, DollarSign, GitCompare, Clock } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import SessionList from '../session/SessionList';

type Panel = 'room' | 'dashboard' | 'cost' | 'diff' | 'timeline';

interface NavItem {
  panel: Panel;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  { panel: 'room', icon: <Home size={20} />, label: 'Room' },
  { panel: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { panel: 'cost', icon: <DollarSign size={20} />, label: 'Cost' },
  { panel: 'diff', icon: <GitCompare size={20} />, label: 'Diff' },
  { panel: 'timeline', icon: <Clock size={20} />, label: 'Timeline' },
];

export default function Sidebar() {
  const activePanel = useUIStore((s) => s.activePanel);
  const setPanel = useUIStore((s) => s.setPanel);

  return (
    <aside className="w-64 bg-gray-800 flex flex-col">
      <div className="flex-1 py-4">
        {navItems.map(({ panel, icon, label }) => (
          <button
            key={panel}
            onClick={() => setPanel(panel)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
              activePanel === panel
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>
      <div className="border-t border-gray-700 p-4">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Sessions</div>
        <SessionList />
      </div>
    </aside>
  );
}
