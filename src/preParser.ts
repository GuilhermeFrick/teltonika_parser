/**
 * Classe responsável pelo pré-processamento de pacotes Teltonika.
 *
 * O objetivo do PreParser é identificar pacotes válidos, associar o IMEI à conexão,
 * validar o CRC e preparar os dados para o parser completo.
 */
import { PreParsedTeltonika } from './types';

export class TeltonikaPreParser {
  /**
   * Mapa interno que associa um `connectionId` ao IMEI identificado.
   */
  private static connectionMap = new Map<string, string>();

  /**
   * Calcula o CRC-16/IBM de um buffer de dados.
   *
   * @param data Buffer com os dados sobre os quais o CRC será calculado
   * @returns Valor numérico de 16 bits do CRC calculado
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
   * Realiza o pré-processamento de um pacote Teltonika, retornando o IMEI e o payload bruto (se válido).
   *
   * Valida o preâmbulo, tamanho, CRC e extrai o IMEI. Caso o pacote contenha apenas o IMEI,
   * armazena esse valor associado ao `connectionId` e retorna resposta de handshake.
   *
   * @param buffer Buffer contendo os dados do pacote Teltonika
   * @param connectionId Identificador da conexão TCP associada (opcional, porém necessário para dados após IMEI)
   * @returns Objeto com resultado do pré-parsing (sucesso ou erro)
   */
  static process(buffer: Buffer, connectionId?: string): PreParsedTeltonika {
    try {
      // Pacote apenas com IMEI (handshake inicial)
      if (buffer.length === 17 && buffer.slice(0, 2).equals(Buffer.from([0x00, 0x0F]))) {
        const imei = buffer.slice(2).toString('ascii');
        if (connectionId) this.connectionMap.set(connectionId, imei);

        return {
          imei,
          isValid: true,
          rawResponse: Buffer.from([0x01]),
        };
      }

      // Se não tiver IMEI associado à conexão
      if (!connectionId || !this.connectionMap.has(connectionId)) {
        return { isValid: false, error: "IMEI não recebido antes dos dados." };
      }

      // Validação de tamanho mínimo
      if (buffer.length < 18) {
        return { isValid: false, error: "Pacote muito curto." };
      }

      // Verificação do preâmbulo
      if (!buffer.slice(0, 4).equals(Buffer.from([0x00, 0x00, 0x00, 0x00]))) {
        return { isValid: false, error: "Preâmbulo inválido." };
      }

      // Extração dos campos
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
