import { config } from '../config';
import logger from '../logger';

interface CacheItem<T> {
  valor: T;
  expiraEm: number;
}

export class MemoryCache {
  private static instancia: MemoryCache;
  private cache: Map<string, CacheItem<any>>;

  private constructor() {
    this.cache = new Map();
    this.iniciarLimpezaAutomatica();
  }

  static obterInstancia(): MemoryCache {
    if (!MemoryCache.instancia) {
      MemoryCache.instancia = new MemoryCache();
    }
    return MemoryCache.instancia;
  }

  set<T>(chave: string, valor: T, ttlPersonalizado?: number): void {
    const ttl = ttlPersonalizado || config.CACHE_TTL;
    const expiraEm = Date.now() + ttl * 1000;
    
    this.cache.set(chave, { valor, expiraEm });
    logger.debug(`Cache definido para chave: ${chave}`);
  }

  get<T>(chave: string): T | null {
    const item = this.cache.get(chave);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiraEm) {
      this.cache.delete(chave);
      logger.debug(`Cache expirado para chave: ${chave}`);
      return null;
    }

    logger.debug(`Cache recuperado para chave: ${chave}`);
    return item.valor;
  }

  delete(chave: string): void {
    this.cache.delete(chave);
    logger.debug(`Cache removido para chave: ${chave}`);
  }

  clear(): void {
    this.cache.clear();
    logger.info('Cache limpo completamente');
  }

  private iniciarLimpezaAutomatica(): void {
    setInterval(() => {
      const agora = Date.now();
      for (const [chave, item] of this.cache.entries()) {
        if (agora > item.expiraEm) {
          this.cache.delete(chave);
          logger.debug(`Limpeza automática: cache removido para chave ${chave}`);
        }
      }
    }, 60000); // Executa a cada minuto
  }
}