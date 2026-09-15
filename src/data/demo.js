const dates = [];
for (let cursor = new Date(Date.UTC(2021, 5, 18)); cursor <= new Date(Date.UTC(2026, 5, 18)); cursor.setUTCDate(cursor.getUTCDate() + 1)) {
  if (![0, 6].includes(cursor.getUTCDay())) dates.push(cursor.toISOString().slice(0, 10));
}

function series(start, drift, wave, phase = 0) {
  let value = start;
  return dates.map((date, index) => {
    const noise = Math.sin(index * 12.9898 + phase * 78.233) * 0.5 + 0.5;
    const cycle = Math.sin(index / 22 + phase) * wave * 0.018;
    const shock = index > 0 && index % 83 === 0 ? (Math.sin(index + phase) > 0 ? 1 : -1) * wave * 0.11 : 0;
    value += drift + (noise - 0.5) * wave * 0.045 + cycle + shock;
    return { date, value: Number(value.toFixed(2)) };
  });
}

export const instruments = [
  { id: 'sp500', label: 'S&P 500', symbol: 'SPX', color: '#73d6ba', kind: 'index' },
  { id: 'nasdaq', label: 'NASDAQ Composite', symbol: 'IXIC', color: '#9a86ff', kind: 'index' },
  { id: 'dow', label: 'Dow Jones', symbol: 'DJI', color: '#ffb86b', kind: 'index' },
  { id: 'us10y', label: '미국 10년물 금리', symbol: 'US10Y', color: '#f87171', kind: 'rate' },
  { id: 'gold', label: '금시세', symbol: 'GOLD', color: '#f4c95d', kind: 'commodity' },
];

export const demoData = {
  sp500: series(5100, 1.7, 52, 0),
  nasdaq: series(16400, 4.7, 170, 0.7),
  dow: series(38500, 2.2, 120, 1.3),
  us10y: series(4.18, -0.002, 0.08, 1.1),
  gold: series(2160, 1.5, 26, 2.2),
};

export const latestDataDate = dates.at(-1);
