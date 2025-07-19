/**
 * Parser for Teltonika Codec8 Extended messages.
 * Uses the same basic layout as Codec8, with additional IO extensions.
 */
export const Codec8ExtendedParser = {
  /**
   * Parses a hexadecimal string containing Codec8 Extended data.
   *
   * @param hex - Hexadecimal string of the message payload.
   * @returns Array of decoded AVL records or an error.
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
        const record = parseRecord(recordHex);
        records.push(record);
        offset += record.size * 2;
      }

      return records;
    } catch (err) {
      return [{ error: 'Error in Codec8 Extended parser', detail: err }];
    }
  }
};

/**
 * Parses a single AVL record (event + GPS + IO) for Codec8 Extended.
 *
 * @param hex - Hexadecimal substring representing the record.
 * @returns Object containing the record data and its size in bytes.
 */
function parseRecord(hex: string): any {
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
    return { error: 'Error parsing Codec8 Extended record', detail: err };
  }
}

/**
 * Parses the IO elements from the final part of the AVL record.
 *
 * @param hex - Hexadecimal substring containing the IO elements.
 * @param totalIO - Total number of expected IO elements.
 * @returns Object containing the decoded IOs and total size read in bytes.
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
 * Converts an 8-character hexadecimal string (4 bytes) to a signed 32-bit integer.
 *
 * @param hex - Hexadecimal string of 8 characters.
 * @returns Corresponding signed integer value.
 */
function toSignedInt(hex: string): number {
  const buffer = Buffer.from(hex, 'hex');
  return buffer.readInt32BE();
}
