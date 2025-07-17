// src/commandBuilder.ts

export class TeltonikaCommandBuilder {
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
    crcBuf.writeUInt16BE(crc, 2); // pad 2 bytes à esquerda como 0x0000

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