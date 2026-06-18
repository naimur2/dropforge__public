import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '../store/hooks';
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

export let globalSocket: AppSocket | null = null;

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<AppSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        globalSocket = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket: AppSocket = io((import.meta as any).env.VITE_API_URL || '', {
      withCredentials: true,
      transports: ['websocket'],
    });

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));

    globalSocket = newSocket;
    setSocket(newSocket);

    return () => {
      globalSocket = null;
      newSocket.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
