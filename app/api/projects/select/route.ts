import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { setCurrentProject } from '@/lib/project-utils';

export async function POST(request: NextRequest) {
  try {
    const { projectPath } = await request.json();
    
    if (!projectPath) {
      return NextResponse.json(
        { error: 'Project path is required' },
        { status: 400 }
      );
    }
    
    // Ensure the project directory exists
    if (!existsSync(projectPath)) {
      return NextResponse.json(
        { error: 'Project directory does not exist' },
        { status: 400 }
      );
    }
    
    // Set the current project
    await setCurrentProject(projectPath);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error selecting project:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}