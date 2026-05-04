import { TeltonikaPreParser } from '../src/preParser';
import { Buffer } from 'buffer';

describe('TeltonikaPreParser', () => {
  const connectionId = 'conn1';

  it('should correctly parse IMEI-only handshake packet', () => {
    const imei = '352093081452251';
    const imeiBuffer = Buffer.concat([
      Buffer.from([0x00, 0x0F]),
      Buffer.from(imei, 'ascii'),
    ]);

    const result = TeltonikaPreParser.process(imeiBuffer, connectionId);

    expect(result.isValid).toBe(true);
    expect(result.imei).toBe(imei);
    expect(result.rawResponse?.toString('hex')).toBe('01');
  });

  it('should reject payload if IMEI was not received first', () => {
    const dummyPayload = Buffer.from('0000000000000008010203040506070800001234', 'hex');

    const result = TeltonikaPreParser.process(dummyPayload, 'unknown');

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/IMEI not received/);
  });

  it('should reject packet with invalid preamble', () => {
    const buffer = Buffer.from('0102030400000008010203040506070800001234', 'hex');
    const result = TeltonikaPreParser.process(buffer, connectionId);
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Invalid preamble/);
  });

  it('should reject short packet', () => {
    const shortBuffer = Buffer.from('00000000000000', 'hex');
    const result = TeltonikaPreParser.process(shortBuffer, connectionId);
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Packet too short/);
  });

  it('should reject packet with bad CRC', () => {
    const imei = '352093081452251';
    const handshake = Buffer.concat([
      Buffer.from([0x00, 0x0F]),
      Buffer.from(imei, 'ascii'),
    ]);
    TeltonikaPreParser.process(handshake, connectionId); // Registrar IMEI

    const payload = Buffer.from('0C0101000000000001', 'hex');
    const crc = Buffer.alloc(4); // CRC inválido de propósito (0)
    const buffer = Buffer.concat([
      Buffer.from([0x00, 0x00, 0x00, 0x00]),           // Preamble
      Buffer.alloc(4, payload.length),                 // Data length (big-endian)
      payload,
      crc,
    ]);
    buffer.writeUInt32BE(payload.length, 4); // corrigir length

    const result = TeltonikaPreParser.process(buffer, connectionId);
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Invalid CRC/);
  });

  it('should parse valid data packet after IMEI', () => {
    const imei = '352093081452251';
    const handshake = Buffer.concat([
      Buffer.from([0x00, 0x0F]),
      Buffer.from(imei, 'ascii'),
    ]);
    TeltonikaPreParser.process(handshake, connectionId); // Registrar IMEI

    const payload = Buffer.from('0C0101000000000001', 'hex');
    const crc = TeltonikaPreParser.crc16(payload);
    const buffer = Buffer.concat([
      Buffer.from([0x00, 0x00, 0x00, 0x00]),
      Buffer.alloc(4), // placeholder for data length
      payload,
      Buffer.alloc(4),
    ]);
    buffer.writeUInt32BE(payload.length, 4);
    buffer.writeUInt32BE(crc, 8 + payload.length);

    const result = TeltonikaPreParser.process(buffer, connectionId);
    expect(result.isValid).toBe(true);
    expect(result.payload?.equals(payload)).toBe(true);
    expect(result.imei).toBe(imei);
  });
});
