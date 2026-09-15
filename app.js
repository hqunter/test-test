import { calculateMdd, calculateReturn, formatDateRange, getChartDomain, getNearestIndex, normalizeSeries, sortByColumn, toggleSelection } from './src/lib/analytics.js';
import { demoData, instruments } from './src/data/demo.js';
import { top100Stocks } from './src/data/top100.js';

const state = { period: 90, selected: ['sp500', 'nasdaq', 'us10y', 'gold'], sortKey: null, sortDirection: 'desc' };
const chart = document.querySelector('#correlation-chart');

const chartInstruments = instruments.filter((item) => ['us10y', 'gold', 'nasdaq', 'sp500'].includes(item.id));
const stockData = Object.fromEntries(top100Stocks.map((stock) => [stock.id, demoSeries(stock.rank)]));
const stockColors = ['#ff8f70', '#7dd3fc', '#c084fc', '#facc15', '#fb7185', '#34d399'];
const stockPicker = document.querySelector('#stock-picker');
document.querySelectorAll('[data-sort-key]').forEach((button) => button.addEventListener('click', () => {
  const key = button.dataset.sortKey;
  state.sortDirection = state.sortKey === key && state.sortDirection === 'desc' ? 'asc' : 'desc';
  state.sortKey = key;
  render();
}));
stockPicker.innerHTML += top100Stocks.map((stock) => `<option value="${stock.id}">#${stock.rank} ${stock.symbol} — ${stock.name}</option>`).join('');
stockPicker.addEventListener('change', () => {
  if (stockPicker.value && !state.selected.includes(stockPicker.value)) state.selected.push(stockPicker.value);
  stockPicker.value = '';
  render();
});

function demoSeries(rank) {
  let value = 60 + (rank * 17) % 140;
  return demoData.us10y.map((point, index) => {
    const wave = Math.sin(index / (8 + rank % 7) + rank) * (rank % 5 + 3);
    const noise = Math.sin(index * (rank + 3) * 0.73) * (rank % 4 + 1.5);
    value += 0.05 + wave * 0.025 + noise * 0.03;
    return { date: point.date, value: Number(Math.max(5, value).toFixed(2)) };
  });
}

function renderTickerButtons() {
  const allItems = [...chartInstruments, ...top100Stocks.filter((stock) => state.selected.includes(stock.id)).map((stock, index) => ({ ...stock, label: stock.name, color: stockColors[index % stockColors.length] }))];
  document.querySelector('#ticker-buttons').innerHTML = allItems.map((item) => `<button class="ticker-button selected" data-ticker="${item.id}"><i style="background:${item.color}"></i>${item.symbol}</button>`).join('');
  document.querySelectorAll('[data-ticker]').forEach((button) => button.addEventListener('click', () => {
  state.selected = toggleSelection(state.selected, button.dataset.ticker);
  render();
  }));
}
document.querySelectorAll('[data-period]').forEach((button) => button.addEventListener('click', () => {
  state.period = Number(button.dataset.period);
  document.querySelectorAll('[data-period]').forEach((item) => item.classList.toggle('selected', item === button));
  render();
}));

function formatCorrelation(value) { return value === null ? '—' : `${value >= 0 ? '+' : ''}${value.toFixed(2)}`; }
function relationship(value) {
  if (value === null) return '데이터 부족';
  if (value >= 0.5) return '강한 양의 관계';
  if (value >= 0.2) return '약한 양의 관계';
  if (value <= -0.5) return '강한 음의 관계';
  if (value <= -0.2) return '약한 음의 관계';
  return '관계 없음';
}
function linePath(values, width, height, min, max) {
  return values.map((value, index) => `${index ? 'L' : 'M'} ${(index / (values.length - 1)) * width} ${height - ((value - min) / (max - min)) * height}`).join(' ');
}
function renderChart(values) {
  const width = 900; const height = 250; const { min, max } = getChartDomain(values.map((item) => item.values));
  const y = (value) => height - ((value - min) / (max - min)) * height;
  const grid = [80, 100, 120].map((value) => `<line x1="0" x2="${width}" y1="${y(value)}" y2="${y(value)}" class="grid-line"/><text x="${width - 4}" y="${y(value) - 7}" class="axis-label" text-anchor="end">${value}</text>`).join('');
  chart.innerHTML = `${grid}${values.map(({ values: seriesValues, color }) => `<path d="${linePath(seriesValues, width, height, min, max)}" class="chart-line" style="stroke:${color}"/>`).join('')}<line id="hover-line" x1="0" x2="0" y1="0" y2="${height}" class="hover-line"/><rect id="chart-hit-area" x="0" y="0" width="${width}" height="${height}" class="chart-hit-area"/>`;
  const hitArea = chart.querySelector('#chart-hit-area'); const hoverLine = chart.querySelector('#hover-line'); const tooltip = document.querySelector('#chart-tooltip');
  hitArea.addEventListener('pointermove', (event) => {
    const rect = hitArea.getBoundingClientRect(); const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)); const index = getNearestIndex(ratio, values[0].values.length); const date = demoData.us10y.slice(-state.period)[index].date;
    const left = ((index / Math.max(1, values[0].values.length - 1)) * 100); hoverLine.setAttribute('x1', `${left * 9}`); hoverLine.setAttribute('x2', `${left * 9}`);
    tooltip.innerHTML = `<strong>${date.replaceAll('-', '.')}</strong>${values.map((item) => `<span><i style="background:${item.color}"></i>${item.label}<b>${item.values[index].toFixed(2)}</b></span>`).join('')}`;
    tooltip.style.left = `${Math.min(78, Math.max(6, left))}%`; tooltip.classList.add('visible');
  });
  hitArea.addEventListener('pointerleave', () => { tooltip.classList.remove('visible'); hoverLine.setAttribute('x1', '0'); hoverLine.setAttribute('x2', '0'); });
}
function renderMarketList() {
  const items = [instruments[3], instruments[4], instruments[0]];
  document.querySelector('#market-list').innerHTML = items.map((item) => {
    const values = demoData[item.id]; const last = values.at(-1).value; const previous = values.at(-2).value; const change = ((last - previous) / previous) * 100;
    return `<div class="market-row"><div class="market-name"><i style="background:${item.color}"></i><span>${item.label}<small>${item.symbol}</small></span></div><strong>${last.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}</strong><span class="change ${change >= 0 ? 'up' : 'down'}">${change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%</span></div>`;
  }).join('');
}
function render() {
  const visible = [...chartInstruments, ...top100Stocks.filter((stock) => state.selected.includes(stock.id)).map((stock, index) => ({ ...stock, label: stock.name, color: stockColors[index % stockColors.length] }))].filter((item) => state.selected.includes(item.id));
  let series = visible.map((item) => { const rawValues = (demoData[item.id] ?? stockData[item.id]).slice(-state.period).map((point) => point.value); return { ...item, rawValues, values: normalizeSeries(rawValues), currentValue: rawValues.at(-1), normalizedValue: normalizeSeries(rawValues).at(-1), returnValue: calculateReturn(rawValues), mdd: calculateMdd(rawValues) }; });
  if (state.sortKey) series = sortByColumn(series, state.sortKey, state.sortDirection);
  document.querySelector('#asset-table-body').innerHTML = series.map((item) => `<tr><td><span class="table-ticker"><i style="background:${item.color}"></i><strong>${item.symbol}</strong><small>${item.label}</small></span></td><td>${item.currentValue.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}</td><td class="${item.returnValue >= 0 ? 'up' : 'down'}">${item.returnValue >= 0 ? '+' : ''}${item.returnValue.toFixed(2)}%</td><td class="down">${item.mdd.toFixed(2)}%</td><td>${item.normalizedValue >= 100 ? '+' : ''}${(item.normalizedValue - 100).toFixed(2)}%</td></tr>`).join('');
  document.querySelector('#chart-legend').innerHTML = series.map((item) => `<span><i class="legend-dot" style="background:${item.color}"></i>${item.label}</span>`).join('');
  const points = demoData[visible[0]?.id ?? 'us10y'].slice(-state.period);
  document.querySelector('#chart-range').textContent = formatDateRange(points.map((point) => point.date));
  const best = [...series].sort((a, b) => b.values.at(-1) - a.values.at(-1))[0];
  document.querySelector('#insight-text').innerHTML = best ? `선택한 기간 동안 <strong>${best.label}</strong>이 기준값 대비 가장 높은 위치에 있습니다. 선택한 티커를 같은 출발점으로 환산했기 때문에 가격 단위가 다른 금리·금시세·지수의 흐름을 직관적으로 비교할 수 있습니다.` : '티커를 하나 이상 선택하면 그래프가 표시됩니다.';
  renderChart(series);
  renderMarketList();
  renderTickerButtons();
}
render();
