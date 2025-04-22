import { NextResponse } from 'next/server';
import { getServerStatus } from '@/lib/server-manager';

export async function GET() {
  try {
    const status = await getServerStatus();
    
    return NextResponse.json({ status });
  } catch (error: any) {
    console.error('Error getting server status:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}