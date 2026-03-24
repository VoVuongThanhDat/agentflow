import React from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { useUIStore } from './stores/uiStore';
import MainLayout from './components/layout/MainLayout';
import IsometricRoom from './components/room/IsometricRoom';
import KanbanBoard from './components/dashboard/KanbanBoard';
import { CostPanel } from './components/cost/CostPanel';
import { DiffViewer } from './components/diff/DiffViewer';
import TimelineView from './components/timeline/TimelineView';
import { NotificationToast } from './components/layout/NotificationToast';

// Error boundary to prevent white screen on HMR/render crashes
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  state = { hasError: false, error: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#f87171', background: '#0f1117', height: '100vh' }}>
          <h2 style={{ marginBottom: 16 }}>Something went wrong</h2>
          <pre style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'pre-wrap' }}>{this.state.error}</pre>
          <button
            onClick={() => { this.setState({ hasError: false, error: '' }); }}
            style={{ marginTop: 16, padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Retry
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, marginLeft: 8, padding: '8px 16px', background: '#374151', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  useWebSocket();
  const activePanel = useUIStore((s) => s.activePanel);

  const panels: Record<string, React.ReactNode> = {
    room: <IsometricRoom />,
    dashboard: <KanbanBoard />,
    cost: <CostPanel />,
    diff: <DiffViewer />,
    timeline: <TimelineView />,
  };

  return (
    <ErrorBoundary>
      <MainLayout>
        {panels[activePanel]}
      </MainLayout>
      <NotificationToast />
    </ErrorBoundary>
  );
}

export default App;
