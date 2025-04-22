import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from './lib/rate-limiter';
import { AuthService } from './lib/auth/auth-service';
import logger from './lib/logger';

const ROTAS_PUBLICAS = ['/api/auth/login', '/api/auth/registro'];

export async function middleware(request: NextRequest) {
  const ip = request.ip || '127.0.0.1';

  // Verificar rate limit
  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    logger.warn(`Rate limit excedido para IP: ${ip}`);
    return new NextResponse(JSON.stringify({
      error: 'Muitas requisições. Tente novamente mais tarde.'
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Verificar autenticação para rotas protegidas
  if (!ROTAS_PUBLICAS.includes(request.nextUrl.pathname)) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return new NextResponse(JSON.stringify({
        error: 'Autenticação necessária'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    try {
      AuthService.verificarToken(token);
    } catch (error) {
      return new NextResponse(JSON.stringify({
        error: 'Token inválido ou expirado'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }

  // Adicionar headers de segurança
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: '/api/:path*',
};