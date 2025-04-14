export interface DisposableEmailService {
  URL: string;
  httpVersion?: "1.1" | "2";
  headers: {
    [key: string]: string;
  };
  headless?: boolean;
  pathResponse: string;
}