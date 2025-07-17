// src/packageParser.ts
import { Codec8Parser } from './codecs/codec8';
import { Codec8ExtendedParser } from './codecs/codec8Extended';
import { Codec12Parser } from './codecs/codec12';
import { Codec13Parser } from './codecs/codec13';
import { Codec14Parser } from './codecs/codec14';
import { Codec16Parser } from './codecs/codec16';

export interface ParsedTeltonikaFrame {
  imei: string;
  codecId: number;
  codecName: string;
  records: any[];
}

export class TeltonikaPackageParser {
  static parse(input: { imei: string; payload: Buffer }): ParsedTeltonikaFrame {
    const rawHex = input.payload.toString('hex');
    const codecIdByte = input.payload[0];
    const codecIdHex = codecIdByte.toString(16).toUpperCase().padStart(2, '0');

    const parser = TeltonikaPackageParser.getParser(codecIdHex);
    if (!parser) {
      throw new Error(`Codec ${codecIdHex} não suportado.`);
    }

    const records = parser.parse(rawHex);
    return {
      imei: input.imei,
      codecId: codecIdByte,
      codecName: `Codec ${codecIdHex}`,
      records,
    };
  }

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
