import React, { useState, useRef, useCallback } from 'react';
import Sidebar from './Sidebar';
import ChatPanel from '../chat/ChatPanel';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [chatWidth, setChatWidth] = useState(384); // default w-96
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(384);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = chatWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startX.current - ev.clientX;
      const newWidth = Math.max(280, Math.min(800, startWidth.current + delta));
      setChatWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [chatWidth]);

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className="w-1 hover:w-1.5 bg-gray-700 hover:bg-indigo-500 cursor-col-resize flex-shrink-0 transition-colors"
      />
      <aside style={{ width: chatWidth }} className="border-l border-gray-700 flex-shrink-0">
        <ChatPanel />
      </aside>
    </div>
  );
}
