// src/codecs/codec14.ts

export const Codec14Parser = {
  parse: (hex: string): any[] => {
    try {
      const buffer = Buffer.from(hex, 'hex');

      const dataLength = buffer.readUInt32BE(4);
      const codecId = buffer.readUInt8(8);
      const commandCount1 = buffer.readUInt8(9);
      const messageType = buffer.readUInt8(10);
      const commandSize = buffer.readUInt32BE(11);

      const imeiBuffer = buffer.slice(15, 23);
      const imei = [...imeiBuffer].map(byte => byte.toString().padStart(2, '0')).join('');

      const commandStart = 23;
      const commandEnd = 15 + commandSize;
      const commandBuffer = buffer.slice(commandStart, commandEnd);
      const command = commandBuffer.toString('ascii');

      const commandCount2 = buffer.readUInt8(commandEnd);
      const crc = buffer.readUInt16BE(buffer.length - 2);

      return [
        {
          codecId,
          commandCount1,
          messageType,
          commandSize,
          imei,
          command,
          commandCount2,
          crc,
        },
      ];
    } catch (err) {
      return [{ error: 'Erro ao parsear Codec14', detail: err }];
    }
  },
};