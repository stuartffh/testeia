import { NextResponse } from 'next/server';
import { WebSocketPair } from '@/lib/websocket-server';

// Singleton for managing WebSocket connections
const wsConnections = new Set<WebSocket>();
let logBuffer: string[] = [];

// Function to broadcast a message to all connected clients
function broadcast(message: string) {
  logBuffer.push(message);
  
  // Keep a reasonable buffer size
  if (logBuffer.length > 1000) {
    logBuffer = logBuffer.slice(-1000);
  }
  
  const data = JSON.stringify({
    type: 'log',
    content: message,
  });
  
  wsConnections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

// Register log output from the child process
export function registerLogOutput(data: string) {
  // Split data by newlines and broadcast each line
  const lines = data.toString().split('\n');
  lines.forEach((line) => {
    if (line.trim()) {
      broadcast(line);
    }
  });
}

export async function GET(request: Request) {
  const { socket, response } = new WebSocketPair();

  socket.addEventListener('open', () => {
    wsConnections.add(socket);
    
    // Send the current log buffer to the new client
    logBuffer.forEach((log) => {
      socket.send(JSON.stringify({
        type: 'log',
        content: log,
      }));
    });
  });

  socket.addEventListener('close', () => {
    wsConnections.delete(socket);
  });

  return response;
}