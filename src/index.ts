import { OutgoingHttpHeaders } from 'http2';
import fetchV2 from './lib/fetch-2.0';
import { DisposableEmailService } from './types';
import { DISPOSABLE_EMAIL_SERVICES, MailServices } from './utils/constant';
import { Headless } from './lib/headless';

export * from './utils/helper';
export * from './utils/constant';
export * from './types';
export * from './lib/fetch-2.0';
export * from './lib/headless';

export type DisposableServiceOptions = {
  /**
   * The default mail service to use.
   * @default MailServices.TEMPMAIL
   */
  mailService?: MailServices;
}

export class DisposableEmailHelper {
  private _mailSvc: DisposableEmailService;

  constructor(options: DisposableServiceOptions) {
    this._mailSvc = DISPOSABLE_EMAIL_SERVICES[options.mailService || MailServices.MAIL10MIN];
  }

  /**
   * Get a disposable email address from the default mail service.
   */
  async getMail(customHeaders: OutgoingHttpHeaders & Record<string, any> = {}): Promise<any> {
    if (this._mailSvc.headless) return this.useHeadless();
    if (this._mailSvc.httpVersion === '2') {
      const result = await fetchV2(this._mailSvc.URL, { ...this._mailSvc.headers, ...customHeaders });
      return result[this._mailSvc.pathResponse];
    }
  }

  private async useHeadless() {
    const headless = Headless.getInstance();
    const browser = await headless.open();
    const page = await browser.newPage();
    await page.goto(this._mailSvc.URL, {
      waitUntil: 'domcontentloaded'
    });
    try {
      await page.waitForSelector('#fe_text');
      return await page.$eval('#fe_text', (el: any) => el.value ?? null);
    } catch (e) {
      console.error('Error fetching email:', e);
      return null;
    } finally {
      await browser.close();
    }
    
  }

  getServices() {
    return [
      'https://10minutemail.net/',
      'https://temp-mail.org/',
    ];
  }
}