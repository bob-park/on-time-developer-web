type DataSizeUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB';

const DATA_UNIT: DataSizeUnit[] = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export function formatDataSize(value: number, unitIndex?: number) {
  const dataUnit = DATA_UNIT[unitIndex ?? 0];

  if (value > 1000) {
    return formatDataSize(value / 1024, (unitIndex ?? 0) + 1);
  }

  return `${Math.floor(value)} ${dataUnit}`;
}
