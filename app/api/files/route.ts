import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, readdir } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('path');
    
    // Get the current project path
    const projectResponse = await fetch('http://localhost:3000/api/projects/current');
    const projectData = await projectResponse.json();
    const projectPath = projectData.currentProject;
    
    if (!projectPath) {
      return NextResponse.json(
        { error: 'No project selected' },
        { status: 400 }
      );
    }
    
    // If a file path is provided, return its content
    if (filePath) {
      // Normalize the path and ensure it's within the project directory
      const normalizedPath = path.normalize(filePath).replace(/^\/+/, '');
      const fullPath = path.join(projectPath, normalizedPath);
      
      // Ensure the path is within the project directory
      if (!fullPath.startsWith(projectPath)) {
        return NextResponse.json(
          { error: 'Invalid file path' },
          { status: 400 }
        );
      }
      
      const content = await readFile(fullPath, 'utf-8');
      return NextResponse.json({ content });
    }
    
    // Otherwise, return the list of files in the project
    const files: string[] = [];
    
    // Recursive function to get all files in a directory
    async function getFiles(dir: string, baseDir: string = '') {
      const entries = await readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const relativePath = path.join(baseDir, entry.name);
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules and .git directories
          if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== '.next') {
            await getFiles(fullPath, relativePath);
          }
        } else {
          files.push(relativePath);
        }
      }
    }
    
    await getFiles(projectPath);
    
    return NextResponse.json({ files });
  } catch (error: any) {
    console.error('Error in files API:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { path: filePath, content } = await request.json();
    
    // Get the current project path
    const projectResponse = await fetch('http://localhost:3000/api/projects/current');
    const projectData = await projectResponse.json();
    const projectPath = projectData.currentProject;
    
    if (!projectPath) {
      return NextResponse.json(
        { error: 'No project selected' },
        { status: 400 }
      );
    }
    
    // Normalize the path and ensure it's within the project directory
    const normalizedPath = path.normalize(filePath).replace(/^\/+/, '');
    const fullPath = path.join(projectPath, normalizedPath);
    
    // Ensure the path is within the project directory
    if (!fullPath.startsWith(projectPath)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }
    
    await writeFile(fullPath, content);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving file:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}