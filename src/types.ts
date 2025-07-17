export interface PreParsedTeltonika {
  imei?: string;
  payload?: Buffer;
  rawResponse?: Buffer;
  isValid: boolean;
  error?: string;
}
