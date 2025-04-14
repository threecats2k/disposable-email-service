import DisposableService, { DisposableServiceOptions } from './index';
import fetchV2 from './lib/fetch-2.0';
import { MailServices } from './utils/constant';

jest.mock('./lib/fetch-2.0');

describe('DisposableService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with the default mail service', () => {
    const service = new DisposableService({});
    expect(service).toBeDefined();
  });

  it('should fetch a disposable email address using fetchV2', async () => {
    const mockResponse = { email: 'test@example.com' };
    (fetchV2 as jest.Mock).mockResolvedValueOnce({ email: 'test@example.com' });

    const service = new DisposableService({ mailService: MailServices.TEMPMAIL });
    const email = await service.getMail();

    expect(fetchV2).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
    expect(email).toEqual(mockResponse.email);
  });

  it('should return a list of supported services', () => {
    const service = new DisposableService({});
    const services = service.getServices();

    expect(services).toEqual([
      'https://10minutemail.net/',
      'https://temp-mail.org/',
    ]);
  });
});