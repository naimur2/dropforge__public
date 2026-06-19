import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@shared/events';

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextValue {
  socket: AppSocket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const globalSocket: AppSocket = io((import.meta as any).env.VITE_API_URL || '', {
  withCredentials: true,
  transports: ['websocket'],
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(globalSocket.connected);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    globalSocket.on('connect', onConnect);
    globalSocket.on('disconnect', onDisconnect);

    return () => {
      globalSocket.off('connect', onConnect);
      globalSocket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: globalSocket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
