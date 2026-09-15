create table if not exists instruments (
  id text primary key,
  label text not null,
  symbol text not null unique,
  kind text not null check (kind in ('index', 'rate', 'commodity')),
  source text not null,
  active boolean not null default true
);

create table if not exists daily_prices (
  instrument_id text not null references instruments(id),
  trading_date date not null,
  close_value numeric not null,
  source text not null,
  created_at timestamptz not null default now(),
  primary key (instrument_id, trading_date)
);

create table if not exists data_sync_runs (
  id bigint generated always as identity primary key,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null check (status in ('running', 'success', 'failed')),
  records_written integer not null default 0,
  error_message text
);

alter table instruments enable row level security;
alter table daily_prices enable row level security;
create policy "public can read active instruments" on instruments for select using (active = true);
create policy "public can read daily prices" on daily_prices for select using (true);

insert into instruments (id, label, symbol, kind, source) values
  ('sp500', 'S&P 500', 'SPX', 'index', 'provider'),
  ('nasdaq', 'NASDAQ Composite', 'IXIC', 'index', 'provider'),
  ('dow', 'Dow Jones', 'DJI', 'index', 'provider'),
  ('us10y', '미국 10년물 금리', 'US10Y', 'rate', 'provider'),
  ('gold', '금시세', 'GOLD', 'commodity', 'provider')
on conflict (id) do update set label = excluded.label, symbol = excluded.symbol, kind = excluded.kind;
