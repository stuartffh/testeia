import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost';
    const ollamaPort = process.env.OLLAMA_PORT || 11434;

    // Ping the Ollama API to check if it's available
    const response = await fetch(`${ollamaHost}:${ollamaPort}/api/tags`, {
      method: 'GET',
    });
    
    if (response.ok) {
      return NextResponse.json({ status: 'online' });
    } else {
      return NextResponse.json(
        { status: 'offline', error: 'A API da Ollama retornou um erro' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { status: 'offline', error: 'Falha ao conectar com a API da Ollama' },
      { status: 500 }
    );
  }
}