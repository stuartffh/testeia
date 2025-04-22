'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ConsolePage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      // Use relative URL for WebSocket to ensure it connects to the same host
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/console`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setConnected(true);
        setLogs(prev => [...prev, '🔌 Connected to console output']);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'log' && data.content) {
            setLogs(prev => [...prev, data.content]);
          }
        } catch (error) {
          // If not JSON, just add the raw message
          setLogs(prev => [...prev, event.data]);
        }
      };
      
      ws.onclose = () => {
        setConnected(false);
        setLogs(prev => [...prev, '❌ Disconnected from console output']);
        
        // Try to reconnect after a delay
        setTimeout(connectWebSocket, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setLogs(prev => [...prev, '⚠️ WebSocket error occurred']);
      };
      
      wsRef.current = ws;
    };
    
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when logs update
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [logs]);

  const clearLogs = () => {
    setLogs([]);
  };

  const downloadLogs = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Console Output</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearLogs}>
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={downloadLogs}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
      <div className="border rounded-lg bg-black text-green-400 font-mono text-sm">
        <div className="bg-gray-900 px-4 py-2 border-b flex justify-between items-center">
          <span>Project Console</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setLogs(prev => [...prev, '🔄 Refreshed connection'])}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea ref={scrollAreaRef} className="h-[calc(100vh-220px)] w-full">
          <div className="p-4 whitespace-pre-wrap">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            ) : (
              <div className="text-gray-500 italic">No console output yet. Start the dev server to see logs here.</div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}