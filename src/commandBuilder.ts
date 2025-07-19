/**
 * Utility class for building commands for Teltonika devices.
 * Currently implements packet construction using Codec 12.
 */
export class TeltonikaCommandBuilder {
  /**
   * Builds a Codec 12 command from an ASCII command string.
   *
   * The generated command follows this structure:
   *   - 4-byte preamble (0x00000000)
   *   - 4-byte length field
   *   - Body including:
   *     - Codec ID (0x0C)
   *     - Number of records (0x01)
   *     - Command type (0x05)
   *     - Command size (4 bytes)
   *     - ASCII command
   *     - Number of records (repeated)
   *   - 4-byte CRC16/ARC (with left padding)
   *
   * @param command ASCII command (e.g., "getver")
   * @returns Complete packet ready to be sent via TCP
   */
  static buildCodec12Command(command: string): Buffer {
    const preamble = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    const codecId = Buffer.from([0x0C]);
    const commandType = Buffer.from([0x05]);
    const commandBuffer = Buffer.from(command, 'ascii');
    const commandLength = Buffer.alloc(4);
    commandLength.writeUInt32BE(commandBuffer.length);
    const recordCount = Buffer.from([0x01]);

    const crcData = Buffer.concat([
      codecId,
      recordCount,
      commandType,
      commandLength,
      commandBuffer,
      recordCount,
    ]);

    const crc = this.calculateCRC16ARC(crcData);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt16BE(crc, 2); // pad 2 bytes on the left as 0x0000

    const packetLength = Buffer.alloc(4);
    packetLength.writeUInt32BE(crcData.length);

    const fullPacket = Buffer.concat([
      preamble,
      packetLength,
      crcData,
      crcBuf,
    ]);

    return fullPacket;
  }

  /**
   * Calculates the CRC16/ARC checksum for a sequence of bytes.
   * 
   * Uses polynomial 0xA001 and initial value 0x0000, as per Teltonika standard.
   *
   * @param data Buffer containing the data to calculate CRC over
   * @returns The computed 16-bit CRC16 value
   */
  static calculateCRC16ARC(data: Buffer): number {
    let crc = 0x0000;
    for (const byte of data) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) {
        if (crc & 1) {
          crc = (crc >> 1) ^ 0xA001;
        } else {
          crc >>= 1;
        }
      }
    }
    return crc & 0xffff;
  }
}
