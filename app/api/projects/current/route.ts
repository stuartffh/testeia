import { NextResponse } from 'next/server';
import { getCurrentProject } from '@/lib/project-utils';

export async function GET() {
  try {
    const currentProject = await getCurrentProject();
    
    return NextResponse.json({ currentProject });
  } catch (error: any) {
    console.error('Error getting current project:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}