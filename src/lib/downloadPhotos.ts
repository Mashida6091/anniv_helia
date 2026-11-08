import { publicUrl, type MediaItem } from './media';

type ArchiveEntry = {
  name: Uint8Array;
  data: Uint8Array;
  crc: number;
  dosTime: number;
  dosDate: number;
};

const MAX_ZIP32_VALUE = 0xffffffff;
const MAX_ZIP_ENTRIES = 0xffff;
const UTF8_FLAG = 0x0800;

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < table.length; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let value = 0xffffffff;
  for (const byte of data) {
    value = CRC32_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
  }
  return (value ^ 0xffffffff) >>> 0;
}

function getDosTimestamp(dateValue: string): { time: number; date: number } {
  const parsed = new Date(dateValue);
  const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const year = Math.min(2107, Math.max(1980, date.getFullYear()));

  return {
    time:
      (date.getHours() << 11) |
      (date.getMinutes() << 5) |
      Math.floor(date.getSeconds() / 2),
    date:
      ((year - 1980) << 9) |
      ((date.getMonth() + 1) << 5) |
      date.getDate(),
  };
}

function safeFileSegment(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function getFileName(item: MediaItem, index: number): string {
  const extensionMatch = item.storage_path.match(/\.([a-z0-9]{1,8})$/i);
  const extension = extensionMatch?.[1]?.toLowerCase() ?? 'jpg';
  const supportedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const safeExtension = supportedExtensions.includes(extension) ? extension : 'jpg';
  const date = new Date(item.created_at);
  const dateLabel = Number.isNaN(date.getTime())
    ? 'sans-date'
    : date.toISOString().slice(0, 10);
  const guest = item.guest_name ? safeFileSegment(item.guest_name) : 'invite';
  const ordinal = String(index + 1).padStart(3, '0');
  const table = String(item.table_number).padStart(2, '0');

  return ordinal + '-table-' + table + '-' + guest + '-' + dateLabel + '.' + safeExtension;
}

function makeLocalHeader(entry: ArchiveEntry): Uint8Array {
  const header = new Uint8Array(30);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, UTF8_FLAG, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, entry.dosTime, true);
  view.setUint16(12, entry.dosDate, true);
  view.setUint32(14, entry.crc, true);
  view.setUint32(18, entry.data.byteLength, true);
  view.setUint32(22, entry.data.byteLength, true);
  view.setUint16(26, entry.name.byteLength, true);
  view.setUint16(28, 0, true);
  return header;
}

function makeCentralHeader(entry: ArchiveEntry, localOffset: number): Uint8Array {
  const header = new Uint8Array(46);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, UTF8_FLAG, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, entry.dosTime, true);
  view.setUint16(14, entry.dosDate, true);
  view.setUint32(16, entry.crc, true);
  view.setUint32(20, entry.data.byteLength, true);
  view.setUint32(24, entry.data.byteLength, true);
  view.setUint16(28, entry.name.byteLength, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, localOffset, true);
  return header;
}

function makeEndRecord(entryCount: number, directorySize: number, directoryOffset: number): Uint8Array {
  const end = new Uint8Array(22);
  const view = new DataView(end.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, entryCount, true);
  view.setUint16(10, entryCount, true);
  view.setUint32(12, directorySize, true);
  view.setUint32(16, directoryOffset, true);
  view.setUint16(20, 0, true);
  return end;
}

export async function createPhotosArchive(
  items: MediaItem[],
  onProgress: (completed: number, total: number) => void,
): Promise<Blob> {
  if (items.length > MAX_ZIP_ENTRIES) {
    throw new Error('too-many-photos');
  }

  const encoder = new TextEncoder();
  const entries: ArchiveEntry[] = [];
  let localRecordsSize = 0;
  let centralDirectorySize = 0;

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const response = await fetch(publicUrl(item));
    if (!response.ok) {
      throw new Error('photo-download-failed');
    }

    const data = new Uint8Array(await response.arrayBuffer());
    const name = encoder.encode(getFileName(item, index));
    const timestamp = getDosTimestamp(item.created_at);
    const entry: ArchiveEntry = {
      name,
      data,
      crc: crc32(data),
      dosTime: timestamp.time,
      dosDate: timestamp.date,
    };

    localRecordsSize += 30 + name.byteLength + data.byteLength;
    centralDirectorySize += 46 + name.byteLength;
    if (
      localRecordsSize > MAX_ZIP32_VALUE ||
      centralDirectorySize > MAX_ZIP32_VALUE ||
      localRecordsSize + centralDirectorySize + 22 > MAX_ZIP32_VALUE
    ) {
      throw new Error('archive-too-large');
    }

    entries.push(entry);
    onProgress(index + 1, items.length);
  }

  const localParts: BlobPart[] = [];
  const centralParts: BlobPart[] = [];
  let localOffset = 0;

  for (const entry of entries) {
    const localHeader = makeLocalHeader(entry);
    localParts.push(localHeader, entry.name, entry.data);
    centralParts.push(makeCentralHeader(entry, localOffset), entry.name);
    localOffset += localHeader.byteLength + entry.name.byteLength + entry.data.byteLength;
  }

  const directoryOffset = localOffset;
  const endRecord = makeEndRecord(entries.length, centralDirectorySize, directoryOffset);
  return new Blob([...localParts, ...centralParts, endRecord], { type: 'application/zip' });
}
