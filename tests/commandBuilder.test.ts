import { TeltonikaCommandBuilder } from '../src/commandBuilder';

describe('TeltonikaCommandBuilder', () => {
  describe('buildCodec12Command', () => {
    it('should build a valid Codec12 packet for "getinfo" command', () => {
      const command = 'getinfo';
      const packet = TeltonikaCommandBuilder.buildCodec12Command(command);

      // Verifica preâmbulo (4 bytes 0x00)
      expect(packet.slice(0, 4)).toEqual(Buffer.from([0x00, 0x00, 0x00, 0x00]));

      // Lê tamanho do payload
      const length = packet.readUInt32BE(4);
      const payload = packet.slice(8, 8 + length);

      // Codec ID deve ser 0x0C
      expect(payload[0]).toBe(0x0C);

      // Número de registros 1
      expect(payload[1]).toBe(0x01);

      // Tipo de comando (0x05)
      expect(payload[2]).toBe(0x05);

      // Tamanho do comando
      const commandLength = payload.readUInt32BE(3);
      expect(commandLength).toBe(command.length);

      // Comando ASCII
      const commandAscii = payload.slice(7, 7 + command.length).toString('ascii');
      expect(commandAscii).toBe(command);

      // Repetição do número de registros
      expect(payload[7 + command.length]).toBe(0x01);

      // CRC de 4 bytes no final do pacote
      const crcBuffer = packet.slice(-4);
      const crc = crcBuffer.readUInt16BE(2); // usa os dois últimos bytes
      const calculatedCrc = TeltonikaCommandBuilder.calculateCRC16ARC(payload);

      expect(crc).toBe(calculatedCrc);
    });
  });
});
