// src/packageParser.ts

import { Codec8Parser } from './codecs/codec8';
import { Codec8ExtendedParser } from './codecs/codec8Extended';
import { Codec12Parser } from './codecs/codec12';
import { Codec13Parser } from './codecs/codec13';
import { Codec14Parser } from './codecs/codec14';
import { Codec16Parser } from './codecs/codec16';

/**
 * Structure representing a decoded Teltonika frame.
 */
export interface ParsedTeltonikaFrame {
  /** Tracker's IMEI */
  imei: string;
  /** Codec identifier (e.g., 0x08, 0x0C, etc.) */
  codecId: number;
  /** Codec name (readable format) */
  codecName: string;
  /** List of decoded records provided by the codec */
  records: any[];
}

/**
 * Class responsible for fully parsing Teltonika packets
 * based on the codec found in the payload. It uses specific parsers
 * for each codec.
 */
export class TeltonikaPackageParser {
  /**
   * Parses the packet based on the provided payload and IMEI.
   *
   * @param input Object containing the IMEI and the payload as a Buffer
   * @returns ParsedTeltonikaFrame structure with decoded data
   * @throws Error if the codec is not supported
   */
  static parse(input: { imei: string; payload: Buffer }): ParsedTeltonikaFrame {
    const rawHex = input.payload.toString('hex');
    const codecIdByte = input.payload[0];
    const codecIdHex = codecIdByte.toString(16).toUpperCase().padStart(2, '0');

    const parser = TeltonikaPackageParser.getParser(codecIdHex);
    if (!parser) {
      throw new Error(`Codec ${codecIdHex} not supported.`);
    }

    const records = parser.parse(rawHex);
    return {
      imei: input.imei,
      codecId: codecIdByte,
      codecName: `Codec ${codecIdHex}`,
      records,
    };
  }

  /**
   * Returns the appropriate parser for the given codec.
   *
   * @param codecId Codec identifier in hexadecimal format (e.g., '08')
   * @returns Object with a parse method or null if codec is unknown
   */
  private static getParser(codecId: string): { parse: (hex: string) => any[] } | null {
    switch (codecId) {
      case '08': return Codec8Parser;
      case '8E': return Codec8ExtendedParser;
      case '0C': return Codec12Parser;
      case '0D': return Codec13Parser;
      case '0E': return Codec14Parser;
      case '10': return Codec16Parser;
      default: return null;
    }
  }
}
