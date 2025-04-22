import { hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { config } from '../config';
import logger from '../logger';

interface Usuario {
  id: string;
  email: string;
  senha: string;
}

export class AuthService {
  private static readonly SALT_ROUNDS = 10;
  private static readonly JWT_EXPIRATION = '24h';

  static async hashSenha(senha: string): Promise<string> {
    try {
      return await hash(senha, this.SALT_ROUNDS);
    } catch (error) {
      logger.error('Erro ao criar hash da senha:', error);
      throw new Error('Erro ao processar senha');
    }
  }

  static async verificarSenha(senha: string, hashSenha: string): Promise<boolean> {
    try {
      return await compare(senha, hashSenha);
    } catch (error) {
      logger.error('Erro ao verificar senha:', error);
      throw new Error('Erro ao verificar senha');
    }
  }

  static gerarToken(usuario: Omit<Usuario, 'senha'>): string {
    try {
      return sign(
        { id: usuario.id, email: usuario.email },
        config.ENCRYPTION_KEY,
        { expiresIn: this.JWT_EXPIRATION }
      );
    } catch (error) {
      logger.error('Erro ao gerar token:', error);
      throw new Error('Erro ao gerar token de autenticação');
    }
  }

  static verificarToken(token: string): any {
    try {
      return verify(token, config.ENCRYPTION_KEY);
    } catch (error) {
      logger.error('Erro ao verificar token:', error);
      throw new Error('Token inválido ou expirado');
    }
  }
}