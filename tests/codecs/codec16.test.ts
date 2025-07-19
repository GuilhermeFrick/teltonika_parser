 import { Codec16Parser } from '../../src/codecs/codec16';

describe('Codec16Parser', () => {
  it('should correctly parse a valid Codec16 command packet', () => {
    const hex = '000000000000000A100105000000026162010000AABB';
    const result = Codec16Parser.parse(hex);

    expect(result).toHaveLength(1);
    expect(result[0].codecId).toBe(0x10);
    expect(result[0].messageType).toBe(0x05);
    expect(result[0].commandSize).toBe(2);
    expect(result[0].commandHex).toBe('6162');
    expect(result[0].commandAscii).toBe('ab');
    expect(result[0].commandCount1).toBe(1);
    expect(result[0].commandCount2).toBe(1);
    expect(result[0].crc).toBe(0xAABB); // CRC de teste fictício
  });

  it('should return error on malformed packet', () => {
    const malformedHex = '00000000000000ZZ10010500000002616201';
    const result = Codec16Parser.parse(malformedHex);

    expect(result[0]).toHaveProperty('error');
  });
});
