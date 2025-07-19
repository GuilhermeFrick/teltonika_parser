/**
 * Parser for Teltonika Codec 8 packets.
 * Responsible for extracting AVL records and telemetry data.
 */
export const Codec8Parser = {
  /**
   * Parses the Codec 8 payload.
   * @param hex Data in hexadecimal format (full payload).
   * @returns List of decoded records or an error.
   */
  parse: (hex: string): any[] => {
    try {
      const dataFieldLength = parseInt(hex.slice(8, 16), 16);
      const codecId = hex.slice(16, 18);
      const numRecords = parseInt(hex.slice(18, 20), 16);
      const avlData = hex.slice(20, 20 + dataFieldLength * 2);

      let offset = 0;
      const records: any[] = [];

      for (let i = 0; i < numRecords; i++) {
        const recordHex = avlData.slice(offset);
        const record = parseCodec8Record(recordHex);
        records.push(record);
        offset += record.size * 2;
      }

      return records;
    } catch (err) {
      return [{ error: 'Error in Codec8 parser', detail: err }];
    }
  }
};

/**
 * Parses a single AVL record in Codec 8 format.
 * @param hex Record in hexadecimal format.
 * @returns Object containing decoded data.
 */
function parseCodec8Record(hex: string): any {
  try {
    let offset = 0;
    const timestamp = parseInt(hex.slice(offset, offset + 16), 16);
    const time = new Date(timestamp);
    offset += 16;

    const priority = parseInt(hex.slice(offset, offset + 2), 16);
    offset += 2;

    const longitude = toSignedInt(hex.slice(offset, offset + 8)) / 1e7;
    offset += 8;
    const latitude = toSignedInt(hex.slice(offset, offset + 8)) / 1e7;
    offset += 8;
    const altitude = parseInt(hex.slice(offset, offset + 4), 16);
    offset += 4;
    const angle = parseInt(hex.slice(offset, offset + 4), 16);
    offset += 4;
    const satellites = parseInt(hex.slice(offset, offset + 2), 16);
    offset += 2;
    const speed = parseInt(hex.slice(offset, offset + 4), 16);
    offset += 4;

    const eventIOId = parseInt(hex.slice(offset, offset + 2), 16);
    offset += 2;
    const totalIO = parseInt(hex.slice(offset, offset + 2), 16);
    offset += 2;

    const { ioData, size } = parseIOElements(hex.slice(offset), totalIO);
    offset += size;

    return {
      timestamp: new Date(time.getTime()).toISOString(),
      priority,
      longitude,
      latitude,
      altitude,
      angle,
      satellites,
      speed,
      eventIOId,
      ioData,
      size: offset / 2 // size in bytes
    };
  } catch (err) {
    return { error: 'Error parsing Codec8 record', detail: err };
  }
}

/**
 * Extracts IO elements of various sizes from the Codec 8 payload.
 * @param hex Hex sequence of IO elements.
 * @param totalIO Total number of declared IO elements.
 * @returns Object containing IO data and the total parsed size.
 */
function parseIOElements(hex: string, totalIO: number): { ioData: Record<number, number>, size: number } {
  let offset = 0;
  const ioData: Record<number, number> = {};
  const sizes = [1, 2, 4, 8];

  for (const size of sizes) {
    const count = parseInt(hex.slice(offset, offset + 2), 16);
    offset += 2;
    for (let i = 0; i < count; i++) {
      const id = parseInt(hex.slice(offset, offset + 2), 16);
      offset += 2;
      const value = parseInt(hex.slice(offset, offset + (2 * size)), 16);
      offset += 2 * size;
      ioData[id] = value;
    }
  }

  return { ioData, size: offset };
}

/**
 * Converts a hexadecimal string to a signed 32-bit integer.
 * @param hex Hexadecimal value.
 * @returns Corresponding signed integer.
 */
function toSignedInt(hex: string): number {
  const buffer = Buffer.from(hex, 'hex');
  return buffer.readInt32BE();
}
