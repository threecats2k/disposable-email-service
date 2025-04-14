import { DisposableEmailService } from "../types";

export enum MailServices {
  MAIL10MIN = "https://10minutemail.net/",
  TEMPMAIL = "https://temp-mail.org/",
}

export const DISPOSABLE_EMAIL_SERVICES: Record<MailServices, DisposableEmailService> = {
  [MailServices.MAIL10MIN]: {
    URL: "https://10minutemail.net/",
    httpVersion: "2",
    headless: true,
    headers: {
      ":method": "GET",
      ":path": "/",
      ":scheme": "https",
      accept: "application/json, text/plain, */*",
      "content-type": "application/json", 
    },
    pathResponse: "email",
  },
  [MailServices.TEMPMAIL]: {
    URL: "https://web2.temp-mail.org",
    httpVersion: "2",
    headers: {
      ":method": 
      "POST",
      ":path": "/mailbox",
      ":scheme": "https",
      accept: "application/json, text/plain, */*",
      "content-type": "application/json", 
    },
    pathResponse: "email",
  },
};
