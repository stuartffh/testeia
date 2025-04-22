import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getProjectsDir, getCurrentProject } from '@/lib/project-utils';

export async function GET() {
  try {
    const projectsDir = await getProjectsDir();
    
    // Ensure the projects directory exists
    if (!existsSync(projectsDir)) {
      return NextResponse.json({ projects: [] });
    }
    
    // Get all directories in the projects directory
    const entries = await readdir(projectsDir, { withFileTypes: true });
    const projects = entries
      .filter(entry => entry.isDirectory())
      .map(entry => ({
        name: entry.name,
        path: path.join(projectsDir, entry.name),
      }));
    
    // Get the current project
    const currentProject = await getCurrentProject();
    
    return NextResponse.json({ projects, currentProject });
  } catch (error: any) {
    console.error('Error in projects API:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}