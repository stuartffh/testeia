import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  try {
    // Get CPU usage (this is a crude approximation)
    const cpuCount = os.cpus().length;
    const loadAvg = os.loadavg()[0];
    const cpuUsage = Math.min(Math.round((loadAvg / cpuCount) * 100), 100);
    
    // Get memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = Math.round(((totalMem - freeMem) / totalMem) * 100);
    
    return NextResponse.json({
      cpu: cpuUsage,
      memory: memoryUsage,
      uptime: os.uptime(),
      platform: os.platform(),
      hostname: os.hostname(),
    });
  } catch (error: any) {
    console.error('Error getting system stats:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}