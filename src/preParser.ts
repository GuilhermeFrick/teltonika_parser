/**
 * Class responsible for pre-processing Teltonika packets.
 *
 * The goal of the PreParser is to identify valid packets, associate the IMEI with the connection,
 * validate the CRC, and prepare the data for full parsing.
 */
import { PreParsedTeltonika } from './types';

export class TeltonikaPreParser {
  /**
   * Internal map that associates a `connectionId` with the identified IMEI.
   */
  private static connectionMap = new Map<string, string>();

  /**
   * Computes the CRC-16/IBM for a data buffer.
   *
   * @param data Buffer containing the data for CRC calculation
   * @returns 16-bit numeric value of the calculated CRC
   */
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

  /**
   * Performs pre-processing of a Teltonika packet, returning the IMEI and raw payload (if valid).
   *
   * Validates the preamble, length, CRC, and extracts the IMEI. If the packet only contains the IMEI,
   * it stores that value associated with the `connectionId` and returns a handshake response.
   *
   * @param buffer Buffer containing the Teltonika packet data
   * @param connectionId Optional TCP connection identifier (required for packets after the IMEI)
   * @returns Object with the result of pre-parsing (success or error)
   */
  static process(buffer: Buffer, connectionId?: string): PreParsedTeltonika {
    try {
      // IMEI-only packet (initial handshake)
      if (buffer.length === 17 && buffer.slice(0, 2).equals(Buffer.from([0x00, 0x0F]))) {
        const imei = buffer.slice(2).toString('ascii');
        if (connectionId) this.connectionMap.set(connectionId, imei);

        return {
          imei,
          isValid: true,
          rawResponse: Buffer.from([0x01]),
        };
      }

      // If no IMEI is associated with the connection
      if (!connectionId || !this.connectionMap.has(connectionId)) {
        return { isValid: false, error: "IMEI not received before data." };
      }

      // Minimum size validation
      if (buffer.length < 18) {
        return { isValid: false, error: "Packet too short." };
      }

      // Preamble verification
      if (!buffer.slice(0, 4).equals(Buffer.from([0x00, 0x00, 0x00, 0x00]))) {
        return { isValid: false, error: "Invalid preamble." };
      }

      // Field extraction
      const dataLength = buffer.readUInt32BE(4);
      const payloadStart = 8;
      const payloadEnd = payloadStart + dataLength;
      const crcStart = payloadEnd;
      const crcEnd = crcStart + 4;

      if (buffer.length < crcEnd) {
        return { isValid: false, error: "Incomplete packet for CRC." };
      }

      const payload = buffer.slice(payloadStart, payloadEnd);
      const receivedCrc = buffer.readUInt32BE(crcStart);
      const calculatedCrc = this.crc16(payload);

      if (receivedCrc !== calculatedCrc) {
        return { isValid: false, error: `Invalid CRC. Expected ${calculatedCrc}, received ${receivedCrc}` };
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
