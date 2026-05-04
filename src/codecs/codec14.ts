/**
 * Parser para pacotes Teltonika Codec14.
 *
 * Codec14 é utilizado para o envio de comandos do servidor para o dispositivo,
 * incluindo informações como IMEI, tipo de comando e o comando em si.
 */
export const Codec14Parser = {
  /**
   * Realiza o parsing de uma string hexadecimal representando um pacote Codec14.
   *
   * @param hex - String em hexadecimal representando os dados brutos do pacote.
   * @returns Um array com o objeto interpretado contendo os campos do comando,
   *          ou um objeto de erro caso o parsing falhe.
   */
  parse: (hex: string): any[] => {
    try {
      const buffer = Buffer.from(hex, 'hex');

      const dataLength = buffer.readUInt32BE(4);     // Tamanho dos dados úteis
      const codecId = buffer.readUInt8(8);           // ID do codec (esperado: 0x0E)
      const commandCount1 = buffer.readUInt8(9);     // Número de comandos
      const messageType = buffer.readUInt8(10);      // Tipo da mensagem
      const commandSize = buffer.readUInt32BE(11);   // Tamanho total (IMEI + comando)

      const imeiBuffer = buffer.slice(15, 23);       // IMEI em 8 bytes BCD
      const imei = imeiBuffer.toString('hex').padStart(16, '0');

      const commandLength = commandSize - 8;         // Descontando os 8 bytes do IMEI
      const commandStart = 23;
      const commandEnd = commandStart + commandLength;

      const commandBuffer = buffer.slice(commandStart, commandEnd);
      const command = commandBuffer.toString('ascii');

      const commandCount2 = buffer.readUInt8(commandEnd); // 1 byte após o comando

      // CRC está nos 2 últimos bytes do buffer
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
