// src/packageParser.ts

import { Codec8Parser } from './codecs/codec8';
import { Codec8ExtendedParser } from './codecs/codec8Extended';
import { Codec12Parser } from './codecs/codec12';
import { Codec13Parser } from './codecs/codec13';
import { Codec14Parser } from './codecs/codec14';
import { Codec16Parser } from './codecs/codec16';

/**
 * Estrutura representando um frame Teltonika já decodificado.
 */
export interface ParsedTeltonikaFrame {
  /** IMEI do rastreador */
  imei: string;
  /** Identificador do codec (ex: 0x08, 0x0C, etc) */
  codecId: number;
  /** Nome do codec (formato legível) */
  codecName: string;
  /** Lista de registros decodificados fornecidos pelo codec */
  records: any[];
}

/**
 * Classe responsável por realizar o parsing completo de pacotes Teltonika
 * com base no codec informado no payload. Utiliza parsers específicos para
 * cada codec.
 */
export class TeltonikaPackageParser {
  /**
   * Realiza o parsing do pacote a partir do payload e IMEI fornecidos.
   *
   * @param input Objeto contendo o IMEI e o payload em formato Buffer
   * @returns Estrutura ParsedTeltonikaFrame com os dados decodificados
   * @throws Erro se o codec não for suportado
   */
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

  /**
   * Retorna o parser correspondente ao codec informado.
   *
   * @param codecId Identificador do codec em formato hexadecimal (ex: '08')
   * @returns Objeto com método parse ou null se codec for desconhecido
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
