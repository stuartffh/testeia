import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import logger from '../logger';

puppeteer.use(StealthPlugin());

export class BrowserAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async iniciar(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1280, height: 800 });
      logger.info('Navegador iniciado com sucesso');
    } catch (error) {
      logger.error('Erro ao iniciar navegador:', error);
      throw error;
    }
  }

  async navegar(url: string): Promise<void> {
    try {
      if (!this.page) throw new Error('Navegador não iniciado');
      await this.page.goto(url, { waitUntil: 'networkidle0' });
      logger.info(`Navegação concluída: ${url}`);
    } catch (error) {
      logger.error(`Erro ao navegar para ${url}:`, error);
      throw error;
    }
  }

  async extrairDados(seletor: string): Promise<string[]> {
    try {
      if (!this.page) throw new Error('Navegador não iniciado');
      return await this.page.evaluate((sel) => {
        const elementos = Array.from(document.querySelectorAll(sel));
        return elementos.map(el => el.textContent || '');
      }, seletor);
    } catch (error) {
      logger.error('Erro ao extrair dados:', error);
      throw error;
    }
  }

  async preencherFormulario(seletor: string, valor: string): Promise<void> {
    try {
      if (!this.page) throw new Error('Navegador não iniciado');
      await this.page.type(seletor, valor);
    } catch (error) {
      logger.error('Erro ao preencher formulário:', error);
      throw error;
    }
  }

  async clicar(seletor: string): Promise<void> {
    try {
      if (!this.page) throw new Error('Navegador não iniciado');
      await this.page.click(seletor);
    } catch (error) {
      logger.error('Erro ao clicar:', error);
      throw error;
    }
  }

  async fechar(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
        logger.info('Navegador fechado com sucesso');
      }
    } catch (error) {
      logger.error('Erro ao fechar navegador:', error);
      throw error;
    }
  }
}