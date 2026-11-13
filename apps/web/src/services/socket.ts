import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@alix/shared';

const envUrl = (import.meta as unknown as { env?: { VITE_REALTIME_URL?: string } }).env?.VITE_REALTIME_URL;

const REALTIME_URL =
  envUrl ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://alix-realtime.onrender.com');

export type AlixSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socketInstance: AlixSocket | null = null;

export function getSocket(): AlixSocket {
  if (!socketInstance) {
    socketInstance = io(REALTIME_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log(`[ALIX Live] Connected to realtime engine at ${REALTIME_URL} (id: ${socketInstance?.id})`);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log(`[ALIX Live] Disconnected from realtime engine: ${reason}`);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn(`[ALIX Live] Realtime connection status:`, err.message);
    });
  }

  return socketInstance;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export { REALTIME_URL };
