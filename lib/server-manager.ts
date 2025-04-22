import { spawn, ChildProcess } from 'child_process';
import { registerLogOutput } from '@/app/api/console/route';

// Keep track of the current dev server process
let devServerProcess: ChildProcess | null = null;

// Start the dev server
export async function startDevServer(projectPath: string): Promise<void> {
  // Stop any existing dev server
  await stopDevServer();
  
  try {
    // Start the dev server using npm run dev
    devServerProcess = spawn('npm', ['run', 'dev'], {
      cwd: projectPath,
      shell: true,
    });
    
    // Register output handlers
    devServerProcess.stdout?.on('data', (data) => {
      registerLogOutput(data.toString());
    });
    
    devServerProcess.stderr?.on('data', (data) => {
      registerLogOutput(data.toString());
    });
    
    // Register exit handler
    devServerProcess.on('exit', (code) => {
      registerLogOutput(`Process exited with code ${code}`);
      devServerProcess = null;
    });
    
    // Register error handler
    devServerProcess.on('error', (error) => {
      registerLogOutput(`Process error: ${error.message}`);
      devServerProcess = null;
    });
    
    // Log that the server has started
    registerLogOutput('Starting development server...');
  } catch (error: any) {
    console.error('Error starting dev server:', error);
    throw new Error(`Failed to start dev server: ${error.message}`);
  }
}

// Stop the dev server
export async function stopDevServer(): Promise<void> {
  if (devServerProcess) {
    // Kill the dev server process
    try {
      // On Windows, use taskkill to kill the process and its children
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', `${devServerProcess.pid}`, '/f', '/t']);
      } else {
        // On Unix-like systems, kill the process group
        process.kill(-devServerProcess.pid, 'SIGKILL');
      }
    } catch (error) {
      console.error('Error killing dev server process:', error);
    }
    
    // Register that the server has stopped
    registerLogOutput('Development server stopped.');
    
    // Reset the process
    devServerProcess = null;
  }
}

// Get the server status
export async function getServerStatus(): Promise<'running' | 'stopped'> {
  return devServerProcess ? 'running' : 'stopped';
}