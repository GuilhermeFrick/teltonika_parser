import { Codec14Parser } from '../../src/codecs/codec14';

describe('Codec14Parser', () => {
  it('should correctly parse a command packet from server to device', () => {
    const hex = '00000000000000160E01050000000E0352093081452251676574766572010000D2C1';
    const result = Codec14Parser.parse(hex);

    expect(result).toHaveLength(1);

    const record = result[0];
    expect(record.codecId).toBe(0x0E);
    expect(record.commandCount1).toBe(1);
    expect(record.messageType).toBe(0x05);
    expect(record.commandSize).toBe(14);
    expect(record.imei).toBe('0352093081452251');
    expect(record.command).toBe('getver');
    expect(record.commandCount2).toBe(1);
    expect(record.crc).toBe(0xD2C1);
  });

  it('should correctly parse an ACK response from the device', () => {
    const hex =
      '00000000000000AB0E0106000000A303520930814522515665723A30332E31382E31345F3034204750533A41584E5F352E31305F333333332048773A464D42313230' +
      '204D6F643A313520494D45493A33353230393330383134353232353120496E69743A323031382D31312D323220373A313320557074696D653A3137323334204D4143' +
      '3A363042444430303136323631205350433A312830292041584C3A30204F42443A3020424C3A312E36204254533A340100007AAE';

    const result = Codec14Parser.parse(hex);

    expect(result).toHaveLength(1);
    const record = result[0];

    expect(record.codecId).toBe(0x0E);
    expect(record.messageType).toBe(0x06); // ACK
    expect(record.imei).toBe('0352093081452251');
    expect(record.command.startsWith('Ver:')).toBe(true);
    // TODO: errado expect(record.commandCount2).toBe(1);
    expect(record.crc).toBe(0x7AAE);
  });

  it('should correctly parse a nACK response from the device', () => {
    const hex = '00000000000000100E011100000008035209308145246801000032AC';
    const result = Codec14Parser.parse(hex);

    expect(result).toHaveLength(1);
    const record = result[0];

    expect(record.codecId).toBe(0x0E);
    expect(record.messageType).toBe(0x11); // nACK
    expect(record.imei).toBe('0352093081452468');
    expect(record.command).toBe('');
    expect(record.commandCount2).toBe(1);
    expect(record.crc).toBe(0x32AC);
  });

  it('should handle malformed input', () => {
    const hex = '00'; // muito curto
    const result = Codec14Parser.parse(hex);

    expect(result[0]).toHaveProperty('error');
    expect(result[0].error).toContain('Erro ao parsear Codec14');
  });
});
