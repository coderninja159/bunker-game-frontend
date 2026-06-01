import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ClientGameStatePayload, GameConfig } from '../types';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface UseGameStateReturn {
  socket: Socket | null;
  gameState: ClientGameStatePayload | null;
  connectionStatus: ConnectionStatus;
  playerId: string | null;
  error: string | null;
  createRoom: (config: Partial<GameConfig>, callback?: (res: any) => void) => void;
  joinRoom: (roomId: string, name: string, callback?: (res: any) => void) => void;
  startGame: (roomId: string, callback?: (res: any) => void) => void;
  revealCard: (roomId: string, cardId: string, callback?: (res: any) => void) => void;
  castVote: (roomId: string, targetId: string, callback?: (res: any) => void) => void;
  reconnectSession: (roomId: string, originalId: string, callback?: (res: any) => void) => void;
  disconnectSocket: () => void;
  clearSession: () => void;
}

const DEFAULT_SERVER_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

export function useGameState(serverUrl: string = DEFAULT_SERVER_URL): UseGameStateReturn {
  const [gameState, setGameState] = useState<ClientGameStatePayload | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);

  // Helper to store session info for reconnects
  const persistSession = (roomId: string, pid: string) => {
    localStorage.setItem('bunker_room_id', roomId.toUpperCase());
    localStorage.setItem('bunker_player_id', pid);
  };

  const clearSession = useCallback(() => {
    localStorage.removeItem('bunker_room_id');
    localStorage.removeItem('bunker_player_id');
    setGameState(null);
    setPlayerId(null);
  }, []);

  // Initialize socket connection
  useEffect(() => {
    setConnectionStatus('connecting');
    
    const socket = io(serverUrl, {
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
      autoConnect: true
    });

    socketRef.current = socket;

    // Connect listener
    socket.on('connect', () => {
      console.log(`[Socket Connected] Socket ID: ${socket.id}`);
      setConnectionStatus('connected');
      setError(null);

      // Automatic recovery check
      const cachedRoomId = localStorage.getItem('bunker_room_id');
      const cachedPlayerId = localStorage.getItem('bunker_player_id');

      if (cachedRoomId && cachedPlayerId) {
        console.log(`[Socket Auto-Recover] Attempting reconnection for Room ${cachedRoomId}, Player ${cachedPlayerId}`);
        setConnectionStatus('reconnecting');
        
        socket.emit('room:reconnect', { roomId: cachedRoomId, originalPlayerId: cachedPlayerId }, (res: any) => {
          if (res.success) {
            console.log(`[Socket Auto-Recover] Reconnection Successful! New Socket ID: ${res.newPlayerId}`);
            setPlayerId(res.newPlayerId);
            persistSession(cachedRoomId, res.newPlayerId);
            setConnectionStatus('connected');
          } else {
            console.warn(`[Socket Auto-Recover] Reconnection Failed: ${res.error}`);
            clearSession();
            setConnectionStatus('connected');
          }
        });
      }
    });

    // Game state listener
    socket.on('game:state', (payload: ClientGameStatePayload) => {
      console.log('[Socket Received] game:state payload:', payload);
      setGameState(payload);
      // Ensure playerId stays synchronized
      if (payload.localPlayer?.id) {
        setPlayerId(payload.localPlayer.id);
      }
    });

    // Global room alert logger
    socket.on('game:status_update', (statusUpdate) => {
      console.log('[Socket Update] Status Update:', statusUpdate);
    });

    // Reconnection & dropouts
    socket.on('disconnect', (reason) => {
      console.log(`[Socket Disconnected] Reason: ${reason}`);
      setConnectionStatus('disconnected');
      if (reason === 'io server disconnect' || reason === 'transport close') {
        setConnectionStatus('reconnecting');
      }
    });

    socket.on('connect_error', (err) => {
      console.error(`[Socket Connection Error]:`, err);
      setError(`Server unreachable. Retrying...`);
      setConnectionStatus('reconnecting');
    });

    return () => {
      socket.disconnect();
    };
  }, [serverUrl, clearSession]);

  // EMITTERS

  const createRoom = useCallback((config: Partial<GameConfig>, callback?: (res: any) => void) => {
    if (!socketRef.current) return;
    
    // Default config fallback
    const defaultConfig = {
      maxPlayers: 8,
      discussionTimeLimit: 60,
      votingTimeLimit: 30,
      allowSelfVoting: false,
      reconnectTimeout: 60000,
      ...config
    };

    socketRef.current.emit('room:create', defaultConfig, (res: any) => {
      if (res.success) {
        console.log(`[Socket Created] Room ID: ${res.roomId}`);
      }
      if (callback) callback(res);
    });
  }, []);

  const joinRoom = useCallback((roomId: string, name: string, callback?: (res: any) => void) => {
    if (!socketRef.current) return;
    
    socketRef.current.emit('room:join', { roomId, name }, (res: any) => {
      if (res.success) {
        console.log(`[Socket Joined] Joined Room ${roomId} as Player ID: ${res.playerId}`);
        setPlayerId(res.playerId);
        persistSession(roomId, res.playerId);
      }
      if (callback) callback(res);
    });
  }, []);

  const startGame = useCallback((roomId: string, callback?: (res: any) => void) => {
    if (!socketRef.current) return;
    socketRef.current.emit('game:start', { roomId }, (res: any) => {
      if (callback) callback(res);
    });
  }, []);

  const revealCard = useCallback((roomId: string, cardId: string, callback?: (res: any) => void) => {
    if (!socketRef.current) return;
    socketRef.current.emit('card:reveal', { roomId, cardId }, (res: any) => {
      if (callback) callback(res);
    });
  }, []);

  const castVote = useCallback((roomId: string, targetId: string, callback?: (res: any) => void) => {
    if (!socketRef.current) return;
    socketRef.current.emit('vote:cast', { roomId, targetId }, (res: any) => {
      if (callback) callback(res);
    });
  }, []);

  const reconnectSession = useCallback((roomId: string, originalId: string, callback?: (res: any) => void) => {
    if (!socketRef.current) return;
    setConnectionStatus('reconnecting');
    socketRef.current.emit('room:reconnect', { roomId, originalPlayerId: originalId }, (res: any) => {
      if (res.success) {
        setPlayerId(res.newPlayerId);
        persistSession(roomId, res.newPlayerId);
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
      if (callback) callback(res);
    });
  }, []);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  return {
    socket: socketRef.current,
    gameState,
    connectionStatus,
    playerId,
    error,
    createRoom,
    joinRoom,
    startGame,
    revealCard,
    castVote,
    reconnectSession,
    disconnectSocket,
    clearSession
  };
}
