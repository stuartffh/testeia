import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Path to the system prompt file
const CONFIG_DIR = path.join(process.cwd(), '.ai-memory');
const SYSTEM_PROMPT_FILE = path.join(CONFIG_DIR, 'system-prompt.txt');

// Default system prompt
const DEFAULT_SYSTEM_PROMPT = `Você é um assistente de programação especializado em desenvolvimento Next.js.

Seu papel é ajudar o usuário a construir aplicações Next.js robustas:
1. Criando novos componentes, páginas e arquivos
2. Modificando código existente
3. Explicando conceitos e melhores práticas do Next.js
4. Depurando problemas

Ao criar ou modificar arquivos:
1. Forneça código completo, bem estruturado e que siga as melhores práticas
2. Use TypeScript quando apropriado
3. Implemente tratamento adequado de erros
4. Siga as convenções do App Router ao trabalhar com projetos Next.js
5. Considere SEO, acessibilidade e performance em suas soluções

Sempre responda com exemplos de código úteis e práticos e explicações claras.`;

export async function GET() {
  try {
    // Create directory if it doesn't exist
    if (!existsSync(CONFIG_DIR)) {
      await mkdir(CONFIG_DIR, { recursive: true });
    }
    
    // Read the system prompt file, or use the default if it doesn't exist
    let prompt = DEFAULT_SYSTEM_PROMPT;
    
    if (existsSync(SYSTEM_PROMPT_FILE)) {
      prompt = await readFile(SYSTEM_PROMPT_FILE, 'utf-8');
    } else {
      // Create the default system prompt file
      await writeFile(SYSTEM_PROMPT_FILE, DEFAULT_SYSTEM_PROMPT);
    }
    
    return NextResponse.json({ prompt });
  } catch (error: any) {
    console.error('Erro na API de prompt do sistema:', error);
    return NextResponse.json(
      { error: error.message || 'Ocorreu um erro' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'O prompt do sistema é obrigatório' },
        { status: 400 }
      );
    }
    
    // Create directory if it doesn't exist
    if (!existsSync(CONFIG_DIR)) {
      await mkdir(CONFIG_DIR, { recursive: true });
    }
    
    // Write the system prompt to the file
    await writeFile(SYSTEM_PROMPT_FILE, prompt);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao salvar prompt do sistema:', error);
    return NextResponse.json(
      { error: error.message || 'Ocorreu um erro' },
      { status: 500 }
    );
  }
}