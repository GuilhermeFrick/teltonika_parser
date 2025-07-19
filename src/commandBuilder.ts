/**
 * Classe utilitária para construção de comandos para dispositivos Teltonika.
 * Atualmente implementa montagem de pacotes usando o Codec 12.
 */
export class TeltonikaCommandBuilder {
  /**
   * Constrói um comando Codec 12 a partir de uma string de comando ASCII.
   *
   * O comando gerado possui o seguinte formato:
   *   - 4 bytes de preâmbulo (0x00000000)
   *   - 4 bytes de comprimento
   *   - Corpo com:
   *     - Codec ID (0x0C)
   *     - Número de registros (0x01)
   *     - Tipo de comando (0x05)
   *     - Tamanho do comando (4 bytes)
   *     - Comando em ASCII
   *     - Número de registros (repetido)
   *   - 4 bytes de CRC16/ARC (com padding à esquerda)
   *
   * @param command Comando em ASCII (ex: "getver")
   * @returns Pacote completo pronto para envio via TCP
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

  /**
   * Calcula o CRC16/ARC de uma sequência de bytes.
   * 
   * Utiliza o polinômio 0xA001 e valor inicial 0x0000, seguindo o padrão Teltonika.
   *
   * @param data Buffer de dados para cálculo do CRC
   * @returns Valor do CRC16 calculado (16 bits)
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
