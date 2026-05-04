/**
 * Parser for Teltonika Codec 12 protocol packets.
 * This codec is primarily used for ASCII text commands and responses.
 */
export const Codec12Parser = {
  /**
   * Parses a Codec12 packet in hexadecimal format.
   *
   * @param hex - The hexadecimal string representing the raw received packet.
   * @returns An array containing an object with the extracted Codec12 packet fields.
   *          In case of an error, returns an array with an object describing the error.
   */
  parse: (hex: string): any[] => {
    try {
      const buffer = Buffer.from(hex, 'hex');

      const zeroBytes = buffer.slice(0, 4).toString('hex'); // Always 0x00000000
      const dataLength = buffer.readUInt32BE(4);            // Payload length
      const codecId = buffer.readUInt8(8);                  // Usually 0x0C for Codec12
      const responseCount1 = buffer.readUInt8(9);           // Record count
      const responseType = buffer.readUInt8(10);            // Command/response type (e.g., 0x05)
      const responseLength = buffer.readUInt32BE(11);       // Length of the ASCII response field
      const responseData = buffer.slice(15, 15 + responseLength).toString('ascii'); // Response content
      const responseCount2 = buffer.readUInt8(15 + responseLength);                 // Second counter (should match the first)
      const crc = buffer.readUInt16BE(buffer.length - 2);   // 2-byte CRC at the end of the packet

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
      return [{ error: 'Error while parsing Codec12', detail: err }];
    }
  },
};
