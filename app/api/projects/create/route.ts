import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { getProjectsDir, setCurrentProject } from '@/lib/project-utils';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }
    
    // Sanitize the project name to be a valid directory name
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    
    // Get the projects directory
    const projectsDir = await getProjectsDir();
    
    // Create the full path to the new project
    const projectPath = path.join(projectsDir, sanitizedName);
    
    // Create the project directory
    await mkdir(projectPath, { recursive: true });
    
    // Create a basic package.json file
    const packageJson = {
      name: sanitizedName,
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
      },
    };
    
    await writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create a basic Next.js structure
    await mkdir(path.join(projectPath, 'app'), { recursive: true });
    
    // Create a basic page.js file
    const pageContent = `export default function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to ${name}</h1>
      <p>Edit app/page.js to get started</p>
    </div>
  );
}
`;
    
    await writeFile(path.join(projectPath, 'app', 'page.js'), pageContent);
    
    // Create a basic layout.js file
    const layoutContent = `export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;
    
    await writeFile(path.join(projectPath, 'app', 'layout.js'), layoutContent);
    
    // Set this as the current project
    await setCurrentProject(projectPath);
    
    return NextResponse.json({ success: true, projectPath });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}