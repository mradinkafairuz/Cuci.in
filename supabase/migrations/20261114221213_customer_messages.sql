alter table public.orders
  add column if not exists customer_message text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.orders'::regclass
      and conname = 'orders_customer_message_length_check'
  ) then
    alter table public.orders
      add constraint orders_customer_message_length_check
      check (customer_message is null or char_length(customer_message) <= 500);
  end if;
end;
$$;
