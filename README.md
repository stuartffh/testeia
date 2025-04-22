# IA Programadora Next.js

Um assistente de programação alimentado por IA local para desenvolvimento Next.js.

## Configuração

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no arquivo `.env`:
```env
# Configuração do Servidor
PORT=3000

# Configuração da Ollama
OLLAMA_HOST=http://localhost
OLLAMA_PORT=11434
OLLAMA_MODEL=deepseek-coder
```

3. Instale as dependências:
```bash
npm install
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Variáveis de Ambiente

- `PORT`: Porta em que o servidor Next.js será executado (padrão: 3000)
- `OLLAMA_HOST`: Host onde a Ollama está rodando (padrão: http://localhost)
- `OLLAMA_PORT`: Porta da API da Ollama (padrão: 11434)
- `OLLAMA_MODEL`: Modelo da Ollama a ser usado (padrão: deepseek-coder)

## Funcionalidades

- 💬 Chat com IA para desenvolvimento
- 📝 Editor de código integrado
- 🖥️ Console em tempo real
- 🧠 Sistema de memória para contexto
- 🌓 Tema claro/escuro
- 🚀 Gerenciamento de projetos