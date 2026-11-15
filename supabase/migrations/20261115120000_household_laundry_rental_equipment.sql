-- Focus the public rental catalog on practical household laundry equipment.
update public.b2b_equipment
set description = case lower(name)
  when 'mesin cuci' then 'Untuk mencuci pakaian sehari-hari di rumah.'
  when 'setrika uap' then 'Untuk merapikan pakaian dengan praktis di rumah.'
  when 'mesin pengering' then 'Membantu pakaian lebih cepat kering saat cuaca kurang mendukung.'
  when 'keranjang laundry' then 'Untuk membawa dan memisahkan cucian di rumah.'
  else description
end
where lower(name) in ('mesin cuci', 'setrika uap', 'mesin pengering', 'keranjang laundry');

update public.b2b_equipment
set is_active = false
where lower(name) in ('timbangan digital', 'vacuum cleaner');

insert into public.b2b_equipment (name, description, price, price_unit, quantity_available, is_active)
select seed.name, seed.description, null, null, 0, true
from (values
  ('Steamer pakaian', 'Perapian uap praktis untuk pakaian sehari-hari.'),
  ('Rak jemuran lipat', 'Rak jemur ringkas untuk pakaian di rumah.')
) as seed(name, description)
where not exists (
  select 1
  from public.b2b_equipment equipment
  where lower(equipment.name) = lower(seed.name)
);
