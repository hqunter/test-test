export function toDailyChanges(values) {
  return values.slice(1).map((value, index) => Number((value - values[index]).toFixed(6)));
}

export function calculateCorrelation(left, right) {
  const pairs = left.map((value, index) => [value, right[index]]).filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
  if (pairs.length < 2) return null;
  const leftMean = pairs.reduce((sum, [value]) => sum + value, 0) / pairs.length;
  const rightMean = pairs.reduce((sum, [, value]) => sum + value, 0) / pairs.length;
  const numerator = pairs.reduce((sum, [a, b]) => sum + (a - leftMean) * (b - rightMean), 0);
  const leftVariance = pairs.reduce((sum, [a]) => sum + (a - leftMean) ** 2, 0);
  const rightVariance = pairs.reduce((sum, [, b]) => sum + (b - rightMean) ** 2, 0);
  const denominator = Math.sqrt(leftVariance * rightVariance);
  return denominator === 0 ? null : Number((numerator / denominator).toFixed(3));
}

export function calculateRollingCorrelation(left, right, window) {
  if (window < 2 || left.length !== right.length || left.length < window) return [];
  return Array.from({ length: left.length - window + 1 }, (_, index) => calculateCorrelation(left.slice(index, index + window), right.slice(index, index + window)));
}

export function formatDateRange(dates) {
  const format = (date) => date.replaceAll('-', '.');
  return `${format(dates[0])} — ${format(dates.at(-1))}`;
}

export function normalizeSeries(values) {
  const base = values.find((value) => Number.isFinite(value) && value !== 0);
  return base === undefined ? values.map(() => null) : values.map((value) => Number(((value / base) * 100).toFixed(2)));
}

export function getNearestIndex(positionRatio, pointCount) {
  if (pointCount < 1) return -1;
  return Math.min(pointCount - 1, Math.max(0, Math.round(positionRatio * (pointCount - 1))));
}

export function getChartDomain(seriesList) {
  const values = seriesList.flat().filter(Number.isFinite);
  const rawMin = Math.min(100, ...values);
  const rawMax = Math.max(100, ...values);
  const span = Math.max(10, rawMax - rawMin);
  const padding = span * 0.1;
  return { min: Number((rawMin - padding).toFixed(2)), max: Number((rawMax + padding).toFixed(2)) };
}

export function toggleSelection(selected, ticker) {
  return selected.includes(ticker) ? selected.filter((item) => item !== ticker) : [...selected, ticker];
}

export function calculateReturn(values) {
  if (values.length < 2 || values[0] === 0) return null;
  return Number((((values.at(-1) - values[0]) / values[0]) * 100).toFixed(2));
}

export function calculateMdd(values) {
  if (!values.length) return null;
  let peak = values[0]; let maxDrawdown = 0;
  for (const value of values) {
    peak = Math.max(peak, value);
    maxDrawdown = Math.min(maxDrawdown, ((value - peak) / peak) * 100);
  }
  return Number(Math.abs(maxDrawdown).toFixed(2));
}

export function sortByMetric(items, metric) {
  if (metric === 'return-desc') return [...items].sort((a, b) => b.returnValue - a.returnValue);
  if (metric === 'return-asc') return [...items].sort((a, b) => a.returnValue - b.returnValue);
  if (metric === 'mdd-asc') return [...items].sort((a, b) => b.mdd - a.mdd);
  if (metric === 'mdd-desc') return [...items].sort((a, b) => a.mdd - b.mdd);
  return [...items];
}

export function sortByColumn(items, key, direction = 'desc') {
  return [...items].sort((a, b) => (direction === 'asc' ? 1 : -1) * (a[key] - b[key]));
}
