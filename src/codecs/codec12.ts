// src/codecs/codec12.ts

export const Codec12Parser = {
  parse: (hex: string): any[] => {
    try {
      const buffer = Buffer.from(hex, 'hex');

      const zeroBytes = buffer.slice(0, 4).toString('hex');
      const dataLength = buffer.readUInt32BE(4);
      const codecId = buffer.readUInt8(8);
      const responseCount1 = buffer.readUInt8(9);
      const responseType = buffer.readUInt8(10);
      const responseLength = buffer.readUInt32BE(11);
      const responseData = buffer.slice(15, 15 + responseLength).toString('ascii');
      const responseCount2 = buffer.readUInt8(15 + responseLength);
      const crc = buffer.readUInt16BE(buffer.length - 2);

      return [
        {
          zeroBytes,
          dataLength,
          codecId,
          responseCount1,
          responseType,
          responseLength,
          responseData,
          responseCount2,
          crc,
        },
      ];
    } catch (err) {
      return [{ error: 'Erro ao parsear Codec12', detail: err }];
    }
  },
};