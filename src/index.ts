import { OutgoingHttpHeaders } from 'http2';
import fetchV2 from './lib/fetch-2.0';
import { DisposableEmailService } from './types';
import { DISPOSABLE_EMAIL_SERVICES, MailServices } from './utils/constant';
import { Headless } from './lib/headless';
import { CookieData } from 'puppeteer';
import { OutgoingHttpHeader } from 'http';

export * from './utils/helper';
export * from './utils/constant';
export * from './types';
export * from './lib/fetch-2.0';
export * from './lib/headless';

export type MailRes = {
  email: string | null;
  cookie?: CookieData[];
}

export type ContentMailRes = {
  subject: string | null;
  content: string | null;
  cookie?: CookieData[];
}

export type DisposableServiceOptions = {
  /**
   * The default mail service to use.
   * @default MailServices.TEMPMAIL
   */
  mailService?: MailServices;
}

export type CustomHeader = OutgoingHttpHeaders
  | { cookie?: CookieData[] | undefined }
  | Record<string, any>;

export class DisposableEmailHelper {
  private _mailSvc: DisposableEmailService;

  constructor(options: DisposableServiceOptions) {
    this._mailSvc = DISPOSABLE_EMAIL_SERVICES[options.mailService || MailServices.MAIL10MIN];
  }

  /**
   * Get a disposable email address from the default mail service.
   */
  async getMail(customHeaders: CustomHeader = {}): Promise<MailRes> {
    if (this._mailSvc.headless) return this.useHeadless(customHeaders?.['cookie']);
    if (this._mailSvc.httpVersion === '2') {
      const result = await fetchV2(this._mailSvc.URL, { ...this._mailSvc.headers, ...(customHeaders as OutgoingHttpHeaders) });
      return result[this._mailSvc.pathResponse] ?? { email: null };
    }
    return { email: null };
  }

  /**
   * Get the content of the email received from email address.
   * 
   * @notice This function currently only supports headless services and gets the subject of the email.
   *         Full content fetching is not implemented yet.
   * @param cookie The cookie data to maintain session state.
   * @param from The from email address to check for new emails.
   */
  async getContent(cookie: CookieData[], from: string): Promise<ContentMailRes> {
    if (this._mailSvc.headless) return this.getContentHeadless(cookie, from);
    if (this._mailSvc.httpVersion === '2') {
      throw new Error('Not supported yet for http2');
    }
    return { subject: null, content: null };
  }

  private async useHeadless(cookie?: CookieData[]): Promise<MailRes> {
    const headless = Headless.getInstance();
    const browser = await headless.open();
    if (cookie && cookie.length) {
      browser.setCookie(...cookie);
    }
    const page = await browser.newPage();
    await page.goto(this._mailSvc.URL, {
      waitUntil: 'domcontentloaded'
    });
    try {
      await page.waitForSelector('#fe_text');
      const email = await page.$eval('#fe_text', (el: any) => el.value ?? null);
      const cookie = await browser.cookies();
      return { email, cookie };
    } catch (e) {
      console.error('Error fetching email:', e);
      return { email: null };
    } finally {
      await browser.close();
    }

  }

  private async getContentHeadless(cookie: CookieData[], email: string): Promise<ContentMailRes> {
    return new Promise(async (resolve, reject) => {
      const headless = Headless.getInstance();
      const browser = await headless.open();
      if (cookie && cookie.length) {
        browser.setCookie(...cookie);
      }
      const page = await browser.newPage();
      await page.goto(this._mailSvc.URL, {
        waitUntil: 'domcontentloaded'
      });
      try {
        console.debug("Checking email for:", email);
        await page.waitForSelector('#fe_text');
        let subject = "";
        const interval = setInterval(async () => {
          subject = await page.evaluate((email) => {
            let result = "";
            document.querySelectorAll('#maillist tr').forEach((el) => {
              console.debug(el);
              const from = el.querySelector('td:first-child')?.textContent ?? '';
              console.debug('From:', from);
              if (from.includes(email)) {
                result = el.querySelector('td:nth-child(2)')?.textContent ?? '';
                alert(result);
              }
            });
            return result;
          }, email);
          if (subject) {
            clearInterval(interval);
            resolve({ content: null, subject, cookie: await browser.cookies() });
            await browser.close();
          }
        }, 10000);

        setTimeout(async () => {
          clearInterval(interval);
          resolve({ content: null, subject: null });
          await browser.close();
        }, 10 * 60 * 1000); // Timeout after 10 minutes
      } catch (e) {
        console.error('Error fetching email:', e);
        resolve({ content: null, subject: null });
        await browser.close();
      }
    });


  }

  getServices() {
    return [
      'https://10minutemail.net/',
      'https://temp-mail.org/',
    ];
  }
}