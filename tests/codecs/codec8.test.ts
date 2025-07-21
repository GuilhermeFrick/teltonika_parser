// tests/codecs/codec8.test.ts

import { Codec8Parser } from '../../src/codecs/codec8';

describe('Codec8Parser', () => {
  it('should correctly parse example 1 with full IO structure', () => {
    const hex = '000000000000003608010000016B40D8EA30010000000000000000000000000000000105021503010101425E0F01F10000601A014E0000000000000000010000C7CF';
    const result = Codec8Parser.parse(hex);

    expect(result).toHaveLength(1);
    expect(result[0].timestamp).toBe('2019-06-10T10:04:46.000Z');
    expect(result[0].gps.longitude).toBe(0);
    expect(result[0].io.n1[0]).toEqual({ id: 0x15, value: 3 });
    expect(result[0].io.n4[0]).toEqual({ id: 0xF1, value: 0x0000601A });
    expect(result[0].io.n8[0].id).toBe(0x4E);
  });

  it('should correctly parse example 2 with simpler IO', () => {
    const hex = '000000000000002808010000016B40D9AD80010000000000000000000000000000000103021503010101425E100000010000F22A';
    const result = Codec8Parser.parse(hex);

    expect(result).toHaveLength(1);
    expect(result[0].timestamp).toBe('2019-06-10T10:05:36.000Z');
    expect(result[0].io.n1[1]).toEqual({ id: 0x01, value: 1 });
    expect(result[0].io.n2[0].value).toBe(0x5E10);
  });

  it('should parse multiple AVL records from example 3', () => {
    const hex = '000000000000004308020000016B40D57B480100000000000000000000000000000001010101000000000000016B40D5C1980100000000000000000000000000000001010101000000020000252C';
    const result = Codec8Parser.parse(hex);

    expect(result).toHaveLength(2);
    expect(result[0].timestamp).toBe('2019-06-10T10:01:01.000Z');
    expect(result[1].timestamp).toBe('2019-06-10T10:01:19.000Z');
    //expect(result[0].io.n1[0].value).toBe(0);
    //expect(result[1].io.n1[0].value).toBe(1);
  });
});
