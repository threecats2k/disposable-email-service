import { DisposableEmailHelper, DisposableServiceOptions } from './index';
import fetchV2 from './lib/fetch-2.0';
import { MailServices } from './utils/constant';


jest.setTimeout(10 * 60 * 1000); // 10 minutes

describe('DisposableService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with the default mail service', () => {
    const service = new DisposableEmailHelper({});
    expect(service).toBeDefined();
  });

  it('should fetch real data', async () => {
    const service = new DisposableEmailHelper({ mailService: MailServices.TEMPMAIL });
    const email = await service.getMail({
      'cache-control': 'no-cache',
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="135", "Google Chrome";v="135"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Linux"',
      'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiM2IyNzIyN2RiYzcxNDExM2I1MDNhMjc3NDBmMDY4ZjAiLCJtYWlsYm94IjoiZGVmZWxpNjQyNUBhbmxvY2MuY29tIiwiaWF0IjoxNzQ0Mjg0OTIzfQ.kAhJNIunijYzDmYHKJTgB2gvzIddDLiQd9ge95dSKyk',
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
    });

    expect(fetchV2).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
    expect(email).toBeDefined();
  });

  it('should fetch real data  mail 10m', async () => {
    const service = new DisposableEmailHelper({ mailService: MailServices.MAIL10MIN });
    const { email }  = await service.getMail();
    console.log(email);
    expect(email).toBeDefined();
    expect(email).toMatch(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
  });


  it('should fetch same mail 10m between 2 request', async () => {
    const service = new DisposableEmailHelper({ mailService: MailServices.MAIL10MIN });
    const { email, cookie }  = await service.getMail();
    console.log(email);
    console.log(cookie);
    expect(email).toBeDefined();
    expect(email).toMatch(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
    const { email: email2 }  = await service.getMail({ cookie });  
    expect(email).toBe(email2);
  });

  it('should fetch content mail', async () => {
    const service = new DisposableEmailHelper({ mailService: MailServices.MAIL10MIN });
    const { email, cookie }  = await service.getMail();
    console.log(email);
    console.log(cookie);
    expect(email).toBeDefined();
    expect(email).toMatch(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
    const { content }  = await service.getContent(cookie || [], 'spdev1203@gmail.com');
    console.log(content);
    expect(content).toBeDefined();
  });

});