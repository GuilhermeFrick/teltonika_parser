/**
 * Parser for Teltonika Codec 13 packets.
 * 
 * Codec 13 is typically used for USSD-related responses or extended ASCII data,
 * with a timestamp and response message encoded in the payload.
 */
export const Codec13Parser = {
  /**
   * Parses a Codec13 hex string payload into a structured object.
   * 
   * @param hex - Hexadecimal string representing the raw Codec13 packet.
   * @returns An array containing the parsed response fields, or an error object if parsing fails.
   */
  parse: (hex: string): any[] => {
    try {
      const buffer = Buffer.from(hex, 'hex');

      const dataLength = buffer.readUInt32BE(4);     // Total length of the payload
      const codecId = buffer.readUInt8(8);           // Should be 0x0D for Codec13
      const responseCount1 = buffer.readUInt8(9);    // Record count (usually 1)
      const responseType = buffer.readUInt8(10);     // Type of response (ex: 0x01)
      const responseSize = buffer.readUInt32BE(11);  // Size of the entire response including timestamp
      const timestamp = buffer.readUInt32BE(15) * 1000; // UNIX timestamp (seconds), converted to ms

      const responseStart = 19;
      const responseEnd = responseStart + (responseSize - 4); // excluir os 4 bytes do timestamp
      const response = buffer.slice(responseStart, responseEnd).toString('ascii');

      const responseCount2 = buffer.readUInt8(responseEnd); // Must match responseCount1
      const crc = buffer.readUInt16BE(buffer.length - 2);   // CRC-16 checksum

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
      return [{ error: 'Failed to parse Codec13', detail: err }];
    }
  },
};
