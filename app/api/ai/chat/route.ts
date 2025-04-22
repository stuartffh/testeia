import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

// Define interfaces
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  prompt: string;
  history: ChatMessage[];
}

interface OllamaRequest {
  model: string;
  messages: ChatMessage[];
  stream: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { prompt, history } = body;

    const port = process.env.PORT || 3000;
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost';
    const ollamaPort = process.env.OLLAMA_PORT || 11434;
    const ollamaModel = process.env.OLLAMA_MODEL || 'deepseek-coder';

    // Get memory items to include in the system prompt
    const memoryResponse = await fetch(`http://localhost:${port}/api/memory`);
    const memoryData = await memoryResponse.json();
    const memories = memoryData.memories || [];

    // Get the system prompt
    const systemPromptResponse = await fetch(`http://localhost:${port}/api/system-prompt`);
    const systemPromptData = await systemPromptResponse.json();
    let systemPrompt = systemPromptData.prompt || '';

    // Append memory items to the system prompt if they exist
    if (memories.length > 0) {
      systemPrompt += '\n\nAqui estão alguns itens de memória para considerar:\n';
      memories.forEach((memory: any) => {
        systemPrompt += `\n--- ${memory.title} ---\n${memory.content}\n`;
      });
    }

    // Get the project configuration
    const projectConfigResponse = await fetch(`http://localhost:${port}/api/projects/current`);
    const projectConfig = await projectConfigResponse.json();
    const projectPath = projectConfig.currentProject;

    // If we have a project, add it to the system prompt
    if (projectPath) {
      systemPrompt += `\n\nVocê está trabalhando no projeto localizado em: ${projectPath}`;
    }

    // Prepare the messages for Ollama
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: prompt }
    ];

    // Make request to Ollama
    const ollamaRequest: OllamaRequest = {
      model: ollamaModel,
      messages,
      stream: false
    };

    // Make the request to Ollama
    const ollamaResponse = await fetch(`${ollamaHost}:${ollamaPort}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ollamaRequest),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Erro na API da Ollama: ${ollamaResponse.statusText}`);
    }

    const ollamaData = await ollamaResponse.json();
    const aiResponse = ollamaData.message?.content || 'Não recebi resposta da IA';
    
    // Process the response to look for file operations
    const fileChanges = await processAiResponseForFileOperations(aiResponse, projectPath);

    // Return the response with file changes
    return NextResponse.json({
      content: aiResponse,
      changes: fileChanges.length > 0 ? fileChanges : undefined,
    });
  } catch (error: any) {
    console.error('Erro na API de chat da IA:', error);
    return NextResponse.json(
      { error: error.message || 'Ocorreu um erro' },
      { status: 500 }
    );
  }
}

// Helper function to extract and process file operations from AI response
async function processAiResponseForFileOperations(response: string, projectPath?: string) {
  if (!projectPath) return [];

  const fileChanges = [];
  
  // Simple regex to detect file paths and content in the AI response
  const fileBlockRegex = /```(?:(\w+))\s*(?:filepath|path)?[=:]?\s*["']?([^"'\n]+)["']?\s*\n([\s\S]*?)```/g;
  
  let match;
  while ((match = fileBlockRegex.exec(response)) !== null) {
    const [_, language, filePath, content] = match;
    
    // Validate the path to ensure it's within the project directory
    const normalizedPath = path.normalize(filePath).replace(/^\/+/, '');
    const fullPath = path.join(projectPath, normalizedPath);
    
    // Ensure the path is within the project directory
    if (!fullPath.startsWith(projectPath)) {
      console.warn(`Caminho de arquivo inválido detectado: ${filePath}`);
      continue;
    }
    
    // Write the file
    try {
      await writeFile(fullPath, content);
      fileChanges.push({ path: normalizedPath, content });
    } catch (error) {
      console.error(`Erro ao escrever arquivo ${normalizedPath}:`, error);
    }
  }
  
  return fileChanges;
}