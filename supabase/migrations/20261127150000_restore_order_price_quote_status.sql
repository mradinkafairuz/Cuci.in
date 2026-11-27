alter table public.orders
  add column if not exists price_quote_status text not null default 'DISETUJUI';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_price_quote_status_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_price_quote_status_check
      check (price_quote_status in ('MENUNGGU_TIMBANG', 'MENUNGGU_PERSETUJUAN', 'DISETUJUI', 'DITOLAK'));
  end if;
end
$$;

create index if not exists orders_quote_status_created_idx
  on public.orders (price_quote_status, created_at desc);
