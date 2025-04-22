// API functions for interacting with the backend

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface AiResponse {
  content: string;
  changes?: Array<{
    path: string;
    content: string;
  }>;
}

interface MemoryItem {
  id?: string;
  title: string;
  content: string;
}

export async function getAiResponse(prompt: string, history: Message[]): Promise<AiResponse> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      history: history.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get AI response');
  }

  return response.json();
}

export async function saveFile(path: string, content: string): Promise<void> {
  const response = await fetch('/api/files', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path, content }),
  });

  if (!response.ok) {
    throw new Error('Failed to save file');
  }
}

export async function getMemory(): Promise<{ memories: MemoryItem[] }> {
  const response = await fetch('/api/memory');
  
  if (!response.ok) {
    throw new Error('Failed to get memories');
  }
  
  return response.json();
}

export async function saveMemory(memory: MemoryItem): Promise<void> {
  const response = await fetch('/api/memory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(memory),
  });

  if (!response.ok) {
    throw new Error('Failed to save memory');
  }
}

export async function deleteMemory(id: string): Promise<void> {
  const response = await fetch(`/api/memory?id=${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete memory');
  }
}