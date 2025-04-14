import { Page, Browser } from 'puppeteer';
import puppeteer, { PuppeteerExtraPlugin, VanillaPuppeteer } from 'puppeteer-extra';

import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

export class Headless {
  private static instance: Headless;
  private readonly stealth: any;

  private constructor() {
    this.stealth = StealthPlugin()
    this.stealth.enabledEvasions.delete('iframe.contentWindow')
    this.stealth.enabledEvasions.delete('media.codecs')
    this.stealth.enabledEvasions.delete('user-agent-override')
    puppeteer.use(this.stealth)

    puppeteer.use(AdblockerPlugin({ blockTrackers: true })).use(this.stealth);
   }

  public static getInstance(): Headless {
    if (!Headless.instance) {
      Headless.instance = new Headless();
    }
    return Headless.instance;
  }

  public async open(): Promise<Browser> {
    const config: Parameters<VanillaPuppeteer['launch']>[0] = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=640,640',
        // '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
      ],
      targetFilter: (target: any) => {
        if (target.type() === 'browser' || target.type() === 'tab')
          return true
        return !!target.url()
      }
    };
    return await puppeteer.launch(config);
  }

}