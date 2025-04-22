import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

// Path to the memory file
const MEMORY_DIR = path.join(process.cwd(), '.ai-memory');
const MEMORY_FILE = path.join(MEMORY_DIR, 'memory.json');

// Interface for memory items
interface MemoryItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

// Helper function to get the memories
async function getMemories(): Promise<MemoryItem[]> {
  try {
    // Create directory if it doesn't exist
    if (!existsSync(MEMORY_DIR)) {
      await mkdir(MEMORY_DIR, { recursive: true });
    }
    
    // Read the memory file, or return an empty array if it doesn't exist
    if (!existsSync(MEMORY_FILE)) {
      return [];
    }
    
    const data = await readFile(MEMORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading memory file:', error);
    return [];
  }
}

// Helper function to save memories
async function saveMemories(memories: MemoryItem[]): Promise<void> {
  try {
    // Create directory if it doesn't exist
    if (!existsSync(MEMORY_DIR)) {
      await mkdir(MEMORY_DIR, { recursive: true });
    }
    
    await writeFile(MEMORY_FILE, JSON.stringify(memories, null, 2));
  } catch (error) {
    console.error('Error saving memory file:', error);
    throw new Error('Failed to save memories');
  }
}

export async function GET(request: NextRequest) {
  try {
    const memories = await getMemories();
    return NextResponse.json({ memories });
  } catch (error: any) {
    console.error('Error in memory API:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    const memories = await getMemories();
    
    const newMemory: MemoryItem = {
      id: uuidv4(),
      title,
      content,
      createdAt: new Date().toISOString(),
    };
    
    await saveMemories([...memories, newMemory]);
    
    return NextResponse.json({ success: true, memory: newMemory });
  } catch (error: any) {
    console.error('Error saving memory:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Memory ID is required' },
        { status: 400 }
      );
    }
    
    const memories = await getMemories();
    const filteredMemories = memories.filter(memory => memory.id !== id);
    
    if (memories.length === filteredMemories.length) {
      return NextResponse.json(
        { error: 'Memory not found' },
        { status: 404 }
      );
    }
    
    await saveMemories(filteredMemories);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting memory:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}