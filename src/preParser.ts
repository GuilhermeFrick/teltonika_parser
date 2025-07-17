import { PreParsedTeltonika } from './types';


export class TeltonikaPreParser {
  private static connectionMap = new Map<string, string>();

  static crc16(data: Buffer): number {
    let crc = 0xFFFF;
    for (const byte of data) {
      crc ^= byte << 8;
      for (let i = 0; i < 8; i++) {
        crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : (crc << 1);
        crc &= 0xFFFF;
      }
    }
    return crc;
  }

  static process(buffer: Buffer, connectionId?: string): PreParsedTeltonika {
    try {
      if (buffer.length === 17 && buffer.slice(0, 2).equals(Buffer.from([0x00, 0x0F]))) {
        const imei = buffer.slice(2).toString('ascii');
        if (connectionId) this.connectionMap.set(connectionId, imei);

        return {
          imei,
          isValid: true,
          rawResponse: Buffer.from([0x01]),
        };
      }

      if (!connectionId || !this.connectionMap.has(connectionId)) {
        return { isValid: false, error: "IMEI não recebido antes dos dados." };
      }

      if (buffer.length < 18) {
        return { isValid: false, error: "Pacote muito curto." };
      }

      if (!buffer.slice(0, 4).equals(Buffer.from([0x00, 0x00, 0x00, 0x00]))) {
        return { isValid: false, error: "Preâmbulo inválido." };
      }

      const dataLength = buffer.readUInt32BE(4);
      const payloadStart = 8;
      const payloadEnd = payloadStart + dataLength;
      const crcStart = payloadEnd;
      const crcEnd = crcStart + 4;

      if (buffer.length < crcEnd) {
        return { isValid: false, error: "Pacote incompleto para CRC." };
      }

      const payload = buffer.slice(payloadStart, payloadEnd);
      const receivedCrc = buffer.readUInt32BE(crcStart);
      const calculatedCrc = this.crc16(payload);

      if (receivedCrc !== calculatedCrc) {
        return { isValid: false, error: `CRC inválido. Esperado ${calculatedCrc}, recebido ${receivedCrc}` };
      }

      return {
        imei: this.connectionMap.get(connectionId!),
        payload,
        isValid: true,
      };
    } catch (err: any) {
      return { isValid: false, error: err.message };
    }
  }
}
