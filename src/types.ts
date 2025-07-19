/**
 * Interface representing the result of pre-parsing a Teltonika packet.
 */
export interface PreParsedTeltonika {
  /**
   * IMEI extracted from the packet (if available).
   */
  imei?: string;

  /**
   * Raw payload of the message (if valid).
   */
  payload?: Buffer;

  /**
   * Immediate response to be sent to the device (such as ACK for IMEI).
   */
  rawResponse?: Buffer;

  /**
   * Indicates whether the packet is valid after pre-parsing.
   */
  isValid: boolean;

  /**
   * Error message, if parsing fails.
   */
  error?: string;
}
