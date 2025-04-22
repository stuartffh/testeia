import { z } from 'zod';

const envSchema = z.object({
  // Servidor
  PORT: z.string().transform(Number).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Ollama
  OLLAMA_HOST: z.string().url().default('http://localhost'),
  OLLAMA_PORT: z.string().transform(Number).default('11434'),
  OLLAMA_MODEL: z.string().default('deepseek-coder'),

  // Rate Limiting
  RATE_LIMIT_WINDOW: z.string().transform(Number).default('15'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Cache
  CACHE_TTL: z.string().transform(Number).default('3600'),

  // Timeout
  REQUEST_TIMEOUT: z.string().transform(Number).default('30000'),

  // Logs
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE_PATH: z.string().default('./logs/app.log'),

  // Segurança
  API_KEY_SALT: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(32),
});

export type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Configuração de ambiente inválida:', error);
    process.exit(1);
  }
}

export const config = validateEnv();