// tests/codecs/codec13.test.ts

import { Codec13Parser } from '../../src/codecs/codec13';

describe('Codec13Parser', () => {
  it('should correctly parse a valid Codec13 packet with ASCII response', () => {
    // Exemplo fictício:
    // Timestamp = 0x60D5C2A5 = 1624630181 (Wed Jun 25 2021 12:29:41 GMT)
    // Mensagem ASCII: 'Hello, Codec13!'
    const hex = '00000000000000190D01060000001360D5C2A548656C6C6F2C20436F6465633133210100001234';

    const result = Codec13Parser.parse(hex);
    expect(result).toHaveLength(1);

    const record = result[0];
    expect(record.codecId).toBe(0x0D);
    expect(record.responseType).toBe(0x06);
    expect(record.responseSize).toBe(19);
    expect(record.response).toBe('Hello, Codec13!');
    expect(record.responseCount1).toBe(1);
    expect(record.responseCount2).toBe(1);
    expect(typeof record.timestamp).toBe('string');
    expect(new Date(record.timestamp).getTime()).toBeGreaterThan(0);
    expect(record.crc).toBe(0x1234); // valor fictício, deve bater com CRC real
  });

  it('should handle invalid packet with short length', () => {
    const hex = '00000000';
    const result = Codec13Parser.parse(hex);
    expect(result[0]).toHaveProperty('error');
  });

  it('should parse response with extended message', () => {
    const message = 'USSD response: Balance is 12.50 USD';
    const messageHex = Buffer.from(message, 'ascii').toString('hex');
    const timestamp = 1710000000; // Arbitrário
    const responseSize = 4 + message.length;

    const hex =
      '00000000' +                                 // Preamble
      responseSize.toString(16).padStart(8, '0') + // Data size
      '0D0106' +                                   // CodecId, Qty1, Type
      responseSize.toString(16).padStart(8, '0') + // Response size
      timestamp.toString(16).padStart(8, '0') +    // Timestamp
      messageHex +                                 // Message
      '01' +                                       // Qty2
      '00001234';                                  // CRC (fictício)

    const result = Codec13Parser.parse(hex);
    expect(result).toHaveLength(1);
    expect(result[0].response).toEqual(message); // pode dar erro mais preciso
  });
});
