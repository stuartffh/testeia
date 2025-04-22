import { NextResponse } from 'next/server';
import { stopDevServer } from '@/lib/server-manager';

export async function POST() {
  try {
    // Stop the dev server
    await stopDevServer();
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error stopping server:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}