import type { WSEvent } from '../types';

const WS_BASE = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000';

export interface WSConnection {
  send: (data: object) => void;
  close: () => void;
  onEvent: (callback: (event: WSEvent) => void) => () => void;
}

export function createWSConnection(sessionId: string): WSConnection {
  let socket: WebSocket | null = null;
  const listeners = new Set<(e: WSEvent) => void>();
  let reconnectDelay = 1000;
  let closed = false;

  function connect() {
    socket = new WebSocket(WS_BASE + '/ws/' + sessionId);
    socket.onopen = () => {
      reconnectDelay = 1000;
    };
    socket.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as WSEvent;
        listeners.forEach((fn) => fn(event));
      } catch {
        // Ignore malformed messages
      }
    };
    socket.onclose = () => {
      if (!closed) {
        setTimeout(connect, Math.min(reconnectDelay, 10000));
        reconnectDelay = Math.min(reconnectDelay * 2, 10000);
      }
    };
  }

  connect();

  return {
    send: (data) =>
      socket?.readyState === WebSocket.OPEN && socket.send(JSON.stringify(data)),
    close: () => {
      closed = true;
      socket?.close();
    },
    onEvent: (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };
}
