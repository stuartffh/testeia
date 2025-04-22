'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Server, Database, Cpu, Wifi } from 'lucide-react';

export default function StatusBar() {
  const [ollamaStatus, setOllamaStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [serverStatus, setServerStatus] = useState<'running' | 'stopped' | 'checking'>('checking');
  const [cpuUsage, setCpuUsage] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);

  useEffect(() => {
    const checkStatuses = async () => {
      try {
        // Check Ollama status
        const ollamaResponse = await fetch('/api/ai/status');
        setOllamaStatus(ollamaResponse.ok ? 'online' : 'offline');
        
        // Check server status
        const serverResponse = await fetch('/api/server/status');
        const serverData = await serverResponse.json();
        setServerStatus(serverData.status || 'stopped');
        
        // Get system stats
        const statsResponse = await fetch('/api/system/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setCpuUsage(statsData.cpu || 0);
          setMemoryUsage(statsData.memory || 0);
        }
      } catch (error) {
        console.error('Failed to fetch status:', error);
      }
    };
    
    // Check initially
    checkStatuses();
    
    // Then check every 10 seconds
    const interval = setInterval(checkStatuses, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <StatusCard 
          title="Ollama LLM"
          icon={<Database />}
          status={ollamaStatus === 'online' ? 'Online' : ollamaStatus === 'offline' ? 'Offline' : 'Checking...'}
          color={ollamaStatus === 'online' ? 'green' : ollamaStatus === 'offline' ? 'red' : 'yellow'}
        />
        <StatusCard 
          title="Dev Server"
          icon={<Server />}
          status={serverStatus === 'running' ? 'Running' : serverStatus === 'stopped' ? 'Stopped' : 'Checking...'}
          color={serverStatus === 'running' ? 'green' : serverStatus === 'stopped' ? 'red' : 'yellow'}
        />
      </div>
      
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground flex items-center">
              <Cpu className="h-3 w-3 mr-1.5" /> CPU
            </span>
            <span>{cpuUsage}%</span>
          </div>
          <Progress value={cpuUsage} className="h-1.5" />
        </div>
        
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground flex items-center">
              <Wifi className="h-3 w-3 mr-1.5" /> Memory
            </span>
            <span>{memoryUsage}%</span>
          </div>
          <Progress value={memoryUsage} className="h-1.5" />
        </div>
      </div>
    </div>
  );
}

interface StatusCardProps {
  title: string;
  icon: React.ReactNode;
  status: string;
  color: 'green' | 'red' | 'yellow' | 'blue';
}

function StatusCard({ title, icon, status, color }: StatusCardProps) {
  const getColorClass = () => {
    switch (color) {
      case 'green': return 'text-green-500';
      case 'red': return 'text-red-500';
      case 'yellow': return 'text-yellow-500';
      case 'blue': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-muted-foreground">{icon}</div>
          <div className="text-xs">{title}</div>
        </div>
        <div className={`text-xs font-medium ${getColorClass()}`}>
          {status}
        </div>
      </CardContent>
    </Card>
  );
}