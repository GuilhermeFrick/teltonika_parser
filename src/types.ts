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


export interface ParsedCodec8Record {
  timestamp: string;
  priority: number;
  gps: {
    longitude: number;
    latitude: number;
    altitude: number;
    angle: number;
    satellites: number;
    speed: number;
  };
  io: {
    eventId: number;
    n1: { id: number; value: number }[];
    n2: { id: number; value: number }[];
    n4: { id: number; value: number }[];
    n8: { id: number; value: bigint }[];
  };
}
