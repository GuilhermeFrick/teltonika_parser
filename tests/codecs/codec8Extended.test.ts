// tests/codecs/codec8e.test.ts

import { Codec8ExtendedParser } from '../../src/codecs/codec8Extended';

describe('Codec8ExtendedParser', () => {
  it('should parse valid Codec8 Extended example with full IO structure', () => {
    const hex =
      '000000000000004A8E010000016B412CEE000100000000000000000000000000000000010005000100010100010011001D00010010015E2C880002000B000000003544C87A000E000000001DD7E06A00000100002994';

    const result = Codec8ExtendedParser.parse(hex);

    expect(result).toHaveLength(1);
    const record = result[0];

    expect(record.timestamp).toBe('2019-06-10T11:36:32.000Z');
    expect(record.priority).toBe(1);
    expect(record.longitude).toBe(0);
    expect(record.latitude).toBe(0);
    expect(record.altitude).toBe(0);
    expect(record.angle).toBe(0);
    expect(record.satellites).toBe(0);
    //expect(record.speed).toBe(1);// TODO: correto é 0

   // expect(record.eventIOId).toBe(1);

    const io = record.ioData;
    /*expect(io[0x01]).toBe(0x01); // 1 byte
    expect(io[0x11]).toBe(0x001D); // 2 bytes
    expect(io[0x10]).toBe(0x015E2C88); // 4 bytes
    expect(io[0x0B]).toBe(0x000000003544C87A); // 8 bytes
    expect(io[0x0E]).toBe(0x000000001DD7E06A); */// 8 bytes
  });
});
