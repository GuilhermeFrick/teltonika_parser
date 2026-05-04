/**
 * Ponto de entrada da biblioteca Teltonika Parser.
 *
 * Este módulo reexporta os principais componentes disponíveis:
 * - `TeltonikaPreParser`: Responsável por identificar o IMEI e validar o pacote bruto (header, tail e CRC).
 * - `TeltonikaCommandBuilder`: Constrói comandos no formato Codec 12.
 * - `TeltonikaPackageParser`: Faz o parsing completo da carga útil baseada no codec.
 */

export { TeltonikaPreParser } from './preParser';
export { TeltonikaCommandBuilder } from './commandBuilder';
export { TeltonikaPackageParser } from './packageParser';
