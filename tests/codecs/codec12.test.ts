// tests/codecs/codec12.test.ts

import { Codec12Parser } from '../../src/codecs/codec12';

describe('Codec12Parser', () => {
  it('should parse valid Codec12 command packet (getinfo)', () => {
    const hex = '000000000000000F0C010500000007676574696E666F0100004312';

    const result = Codec12Parser.parse(hex);
    expect(result).toHaveLength(1);

    const cmd = result[0];
    expect(cmd.codecId).toBe(0x0C);
    expect(cmd.responseCount1).toBe(0x01);
    expect(cmd.responseType).toBe(0x05);
    expect(cmd.responseLength).toBe(0x07);
    expect(cmd.responseData).toBe('getinfo');
    expect(cmd.responseCount2).toBe(0x01);
    expect(cmd.crc).toBe(0x4312);
  });

  it('should parse valid Codec12 response packet (getinfo response)', () => {
    const hex =
      '00000000000000900C010600000088494E493A323031392F372F323220373A3232205254433A323031392F372F323220373A3533205253543A32204552523A312053523A302042523A302043463A302046473A3020464C3A302054553A302F302055543A3020534D533A30204E4F4750533A303A3330204750533A31205341543A302052533A332052463A36352053463A31204D443A30010000C78F';

    const result = Codec12Parser.parse(hex);
    expect(result).toHaveLength(1);

    const res = result[0];
    expect(res.codecId).toBe(0x0C);
    expect(res.responseType).toBe(0x06);
    expect(res.responseLength).toBe(0x88);
    expect(res.responseData.startsWith('INI:2019')).toBe(true);
    expect(res.responseData.includes('GPS:1')).toBe(true);
    expect(res.responseCount2).toBe(0x01);
    expect(res.crc).toBe(0xC78F);
  });

  it('should parse valid Codec12 command packet (getio)', () => {
    const hex = '000000000000000D0C010500000005676574696F01000000CB';

    const result = Codec12Parser.parse(hex);
    expect(result).toHaveLength(1);

    const cmd = result[0];
    expect(cmd.codecId).toBe(0x0C);
    expect(cmd.responseType).toBe(0x05);
    expect(cmd.responseData).toBe('getio');
    expect(cmd.crc).toBe(0x00CB);
  });

  it('should parse valid Codec12 response packet (getio response)', () => {
    const hex =
      '00000000000000370C01060000002F4449313A31204449323A30204449333A302041494E313A302041494E323A313639323420444F313A3020444F323A3101000066E3';

    const result = Codec12Parser.parse(hex);
    expect(result).toHaveLength(1);

    const res = result[0];
    expect(res.codecId).toBe(0x0C);
    expect(res.responseType).toBe(0x06);
    expect(res.responseData).toContain('DI1:1');
    expect(res.responseData).toContain('DO2:1');
    expect(res.crc).toBe(0x66E3);
  });

  it('should return error on malformed packet', () => {
    const hex = '00000000000000'; // Invalid/incomplete
    const result = Codec12Parser.parse(hex);
    expect(result[0]).toHaveProperty('error');
  });
});
