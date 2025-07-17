// src/codecs/codec13.ts

export const Codec13Parser = {
  parse: (hex: string): any[] => {
    try {
      const buffer = Buffer.from(hex, 'hex');

      const dataLength = buffer.readUInt32BE(4);
      const codecId = buffer.readUInt8(8);
      const responseCount1 = buffer.readUInt8(9);
      const responseType = buffer.readUInt8(10);
      const responseSize = buffer.readUInt32BE(11);
      const timestamp = buffer.readUInt32BE(15) * 1000;
      const responseStart = 19;
      const responseEnd = responseStart + (responseSize - 4);
      const response = buffer.slice(responseStart, responseEnd).toString('ascii');
      const responseCount2 = buffer.readUInt8(responseEnd);
      const crc = buffer.readUInt16BE(buffer.length - 2);

      return [
        {
          codecId,
          responseCount1,
          responseType,
          responseSize,
          timestamp: new Date(timestamp).toISOString(),
          response,
          responseCount2,
          crc,
        },
      ];
    } catch (err) {
      return [{ error: 'Erro ao parsear Codec13', detail: err }];
    }
  },
};