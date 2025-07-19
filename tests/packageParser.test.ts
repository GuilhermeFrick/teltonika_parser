import { TeltonikaPackageParser } from '../src/packageParser';

jest.mock('../../src/codecs/codec8', () => ({
  Codec8Parser: {
    parse: jest.fn().mockReturnValue([{ mock: 'codec8' }]),
  },
}));

jest.mock('../../src/codecs/codec8Extended', () => ({
  Codec8ExtendedParser: {
    parse: jest.fn().mockReturnValue([{ mock: 'codec8Extended' }]),
  },
}));

jest.mock('../../src/codecs/codec12', () => ({
  Codec12Parser: {
    parse: jest.fn().mockReturnValue([{ mock: 'codec12' }]),
  },
}));

jest.mock('../../src/codecs/codec13', () => ({
  Codec13Parser: {
    parse: jest.fn().mockReturnValue([{ mock: 'codec13' }]),
  },
}));

jest.mock('../../src/codecs/codec14', () => ({
  Codec14Parser: {
    parse: jest.fn().mockReturnValue([{ mock: 'codec14' }]),
  },
}));

jest.mock('../../src/codecs/codec16', () => ({
  Codec16Parser: {
    parse: jest.fn().mockReturnValue([{ mock: 'codec16' }]),
  },
}));

describe('TeltonikaPackageParser', () => {
  const imei = '352093081452251';

  it.each([
    [0x08, 'Codec 08', [{ mock: 'codec8' }]],
    [0x8E, 'Codec 8E', [{ mock: 'codec8Extended' }]],
    [0x0C, 'Codec 0C', [{ mock: 'codec12' }]],
    [0x0D, 'Codec 0D', [{ mock: 'codec13' }]],
    [0x0E, 'Codec 0E', [{ mock: 'codec14' }]],
    [0x10, 'Codec 10', [{ mock: 'codec16' }]],
  ])('should parse known codec 0x%s', (codecByte, expectedName, expectedRecords) => {
    const payload = Buffer.from([codecByte, 0x01, 0x02, 0x03]); // dummy
    const result = TeltonikaPackageParser.parse({ imei, payload });

    expect(result.imei).toBe(imei);
    expect(result.codecId).toBe(codecByte);
    expect(result.codecName).toBe(expectedName);
    expect(result.records).toEqual(expectedRecords);
  });

});
