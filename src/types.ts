/**
 * Interface que representa o resultado do pré-parsing de um pacote Teltonika.
 */
export interface PreParsedTeltonika {
  /**
   * IMEI extraído do pacote (caso disponível).
   */
  imei?: string;

  /**
   * Payload bruto da mensagem (caso válida).
   */
  payload?: Buffer;

  /**
   * Resposta imediata a ser enviada ao dispositivo (como ACK ao IMEI).
   */
  rawResponse?: Buffer;

  /**
   * Indica se o pacote é válido após o pré-parsing.
   */
  isValid: boolean;

  /**
   * Mensagem de erro, se o parsing falhar.
   */
  error?: string;
}
