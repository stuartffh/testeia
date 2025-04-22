/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  env: {
    PORT: process.env.PORT || 3000,
    OLLAMA_HOST: process.env.OLLAMA_HOST || 'http://localhost',
    OLLAMA_PORT: process.env.OLLAMA_PORT || 11434,
    OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'deepseek-coder',
  },
};

module.exports = nextConfig;