import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import os from 'os';

// Configuration file
const CONFIG_DIR = path.join(process.cwd(), '.ai-memory');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Default projects directory
const DEFAULT_PROJECTS_DIR = path.join(os.homedir(), 'ai-coder-projects');

// Interface for the config file
interface Config {
  projectsDir: string;
  currentProject?: string;
}

// Get the default config
async function getDefaultConfig(): Promise<Config> {
  return {
    projectsDir: DEFAULT_PROJECTS_DIR,
  };
}

// Get the config
async function getConfig(): Promise<Config> {
  try {
    // Create directory if it doesn't exist
    if (!existsSync(CONFIG_DIR)) {
      await mkdir(CONFIG_DIR, { recursive: true });
    }
    
    // Read the config file, or use the default if it doesn't exist
    if (existsSync(CONFIG_FILE)) {
      const data = await readFile(CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    } else {
      const defaultConfig = await getDefaultConfig();
      
      // Create the projects directory if it doesn't exist
      if (!existsSync(defaultConfig.projectsDir)) {
        await mkdir(defaultConfig.projectsDir, { recursive: true });
      }
      
      // Create the config file with the default config
      await writeFile(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
      
      return defaultConfig;
    }
  } catch (error) {
    console.error('Error reading config file:', error);
    return getDefaultConfig();
  }
}

// Save the config
async function saveConfig(config: Config): Promise<void> {
  try {
    // Create directory if it doesn't exist
    if (!existsSync(CONFIG_DIR)) {
      await mkdir(CONFIG_DIR, { recursive: true });
    }
    
    await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error saving config file:', error);
    throw new Error('Failed to save config');
  }
}

// Get the projects directory
export async function getProjectsDir(): Promise<string> {
  const config = await getConfig();
  
  // Create the projects directory if it doesn't exist
  if (!existsSync(config.projectsDir)) {
    await mkdir(config.projectsDir, { recursive: true });
  }
  
  return config.projectsDir;
}

// Get the current project
export async function getCurrentProject(): Promise<string | undefined> {
  const config = await getConfig();
  return config.currentProject;
}

// Set the current project
export async function setCurrentProject(projectPath: string): Promise<void> {
  const config = await getConfig();
  config.currentProject = projectPath;
  await saveConfig(config);
}