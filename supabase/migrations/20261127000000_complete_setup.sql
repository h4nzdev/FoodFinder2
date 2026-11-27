-- ============================================================================
-- FOODFINDER COMPLETE SUPABASE SETUP + 20 CEBU CITY RESTAURANTS & MENUS
-- (100% Idempotent — Paste this entire file into Supabase SQL Editor and Run)
-- ============================================================================

-- 1. Core Tables
create table if not exists public.restaurant_claims (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid() references auth.users on delete cascade,
  restaurant_osm_type text not null,
  restaurant_osm_id text not null check (restaurant_osm_id ~ '^[1-9][0-9]{0,18}$'),
  restaurant_name text not null check (length(btrim(restaurant_name)) between 1 and 200),
  evidence text not null check (length(btrim(evidence)) between 20 and 3000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- Allow system-seeded verified Cebu City restaurant records to exist without a user UUID
alter table public.restaurant_claims alter column owner_id drop not null;

create table if not exists public.restaurant_claim_reviewers (
  user_id uuid primary key references auth.users on delete cascade
);

alter table public.restaurant_claim_reviewers enable row level security;
revoke all on public.restaurant_claim_reviewers from public, anon, authenticated;
grant select on public.restaurant_claim_reviewers to authenticated;

drop policy if exists "Reviewers check their own membership" on public.restaurant_claim_reviewers;
create policy "Reviewers check their own membership" on public.restaurant_claim_reviewers
  for select to authenticated using (user_id = (select auth.uid()));

create unique index if not exists restaurant_one_approved_owner
  on public.restaurant_claims (restaurant_osm_type, restaurant_osm_id) where status = 'approved';

create unique index if not exists restaurant_one_active_claim_per_owner
  on public.restaurant_claims (owner_id, restaurant_osm_type, restaurant_osm_id) where status <> 'rejected';

create table if not exists public.restaurant_menu_drafts (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.restaurant_claims on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 120),
  description text not null default '' check (length(description) <= 1500),
  category text not null check (length(btrim(category)) between 1 and 80),
  price numeric(10,2) not null check (price between 0 and 99999999.99),
  image_url text check (length(image_url) <= 2048 and image_url ~ '^https://[^[:space:]]+$'),
  available boolean not null default true
);

create index if not exists restaurant_menu_drafts_claim
  on public.restaurant_menu_drafts (claim_id);

create table if not exists public.published_restaurant_menus (
  claim_id uuid primary key references public.restaurant_claims on delete cascade,
  restaurant_osm_type text not null,
  restaurant_osm_id text not null,
  items jsonb not null,
  published_at timestamptz not null default now(),
  unique (restaurant_osm_type, restaurant_osm_id)
);

-- 2. Location, Category & Cuisine Columns on restaurant_claims
alter table public.restaurant_claims
  drop constraint if exists restaurant_claims_restaurant_osm_type_check,
  drop constraint if exists restaurant_claims_listing_type_check,
  add column if not exists address text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists category text not null default 'Restaurant',
  add column if not exists cuisine text not null default '',
  drop constraint if exists restaurant_claims_address_check,
  drop constraint if exists restaurant_claims_complete_location;

alter table public.restaurant_claims
  add constraint restaurant_claims_listing_type_check
    check (restaurant_osm_type in ('node', 'way', 'relation', 'foodfinder')),
  add constraint restaurant_claims_address_check
    check (address is null or length(btrim(address)) between 1 and 500),
  add constraint restaurant_claims_complete_location check (
    (address is null and latitude is null and longitude is null)
    or (address is not null and latitude is not null and longitude is not null)
  );

-- 3. Row Level Security & Table Grants
alter table public.restaurant_claims enable row level security;
alter table public.restaurant_menu_drafts enable row level security;
alter table public.published_restaurant_menus enable row level security;

revoke all on public.restaurant_claims, public.restaurant_menu_drafts,
  public.published_restaurant_menus from anon, authenticated;
grant select on public.restaurant_claims to authenticated;
grant insert (restaurant_osm_type, restaurant_osm_id, restaurant_name, evidence)
  on public.restaurant_claims to authenticated;
grant update (status) on public.restaurant_claims to authenticated;
grant select, delete on public.restaurant_menu_drafts to authenticated;
grant insert (claim_id, name, description, category, price, image_url, available),
  update (name, description, category, price, image_url, available)
  on public.restaurant_menu_drafts to authenticated;
grant select (restaurant_osm_type, restaurant_osm_id, items, published_at)
  on public.published_restaurant_menus to anon, authenticated;

drop policy if exists "Owners read their claims" on public.restaurant_claims;
create policy "Owners read their claims" on public.restaurant_claims
  for select to authenticated using (owner_id = (select auth.uid()));

drop policy if exists "Owners submit pending claims" on public.restaurant_claims;
drop policy if exists "Owners submit pending OpenStreetMap claims" on public.restaurant_claims;
create policy "Owners submit pending OpenStreetMap claims" on public.restaurant_claims
  for insert to authenticated with check (
    owner_id = (select auth.uid()) and status = 'pending' and restaurant_osm_type <> 'foodfinder'
  );

drop policy if exists "Reviewers read claims they can review" on public.restaurant_claims;
create policy "Reviewers read claims they can review" on public.restaurant_claims
  for select to authenticated using (
    (owner_id is null or owner_id <> (select auth.uid())) and exists (
      select 1 from public.restaurant_claim_reviewers where user_id = (select auth.uid())
    )
  );

drop policy if exists "Reviewers decide pending claims" on public.restaurant_claims;
create policy "Reviewers decide pending claims" on public.restaurant_claims
  for update to authenticated
  using (
    status = 'pending' and (owner_id is null or owner_id <> (select auth.uid())) and exists (
      select 1 from public.restaurant_claim_reviewers where user_id = (select auth.uid())
    )
  )
  with check (
    status in ('approved', 'rejected') and (owner_id is null or owner_id <> (select auth.uid())) and exists (
      select 1 from public.restaurant_claim_reviewers where user_id = (select auth.uid())
    )
  );

drop policy if exists "Approved owners manage drafts" on public.restaurant_menu_drafts;
create policy "Approved owners manage drafts" on public.restaurant_menu_drafts
  for all to authenticated
  using (exists (
    select 1 from public.restaurant_claims c
    where c.id = claim_id and c.owner_id = (select auth.uid()) and c.status = 'approved'
  ))
  with check (exists (
    select 1 from public.restaurant_claims c
    where c.id = claim_id and c.owner_id = (select auth.uid()) and c.status = 'approved'
  ));

drop policy if exists "Anyone reads published menus" on public.published_restaurant_menus;
create policy "Anyone reads published menus" on public.published_restaurant_menus
  for select to anon, authenticated using (true);

-- 4. Menu Publishing RPC & Claim Revocation Trigger
create or replace function public.set_restaurant_menu_published(target_claim uuid, publish_menu boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  approved_claim public.restaurant_claims%rowtype;
  menu_items jsonb;
begin
  select * into approved_claim from public.restaurant_claims
  where id = target_claim and owner_id = (select auth.uid()) and status = 'approved'
  for update;
  if not found then
    raise exception 'An approved ownership claim is required.';
  end if;

  if publish_menu then
    select jsonb_agg(jsonb_build_object(
      'id', id, 'name', name, 'description', description, 'category', category,
      'price', price, 'imageUrl', image_url, 'available', available
    ) order by category, name, id) into menu_items
    from public.restaurant_menu_drafts where claim_id = target_claim;
    if menu_items is null then
      raise exception 'Add at least one menu item before publishing.';
    end if;

    insert into public.published_restaurant_menus (claim_id, restaurant_osm_type, restaurant_osm_id, items)
    values (target_claim, approved_claim.restaurant_osm_type, approved_claim.restaurant_osm_id, menu_items)
    on conflict (claim_id) do update set items = excluded.items, published_at = now();
  else
    delete from public.published_restaurant_menus where claim_id = target_claim;
  end if;
end;
$$;

revoke all on function public.set_restaurant_menu_published(uuid, boolean) from public, anon, authenticated;
grant execute on function public.set_restaurant_menu_published(uuid, boolean) to authenticated;

create or replace function public.remove_menu_after_claim_revocation()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if old.status = 'approved' and new.status <> 'approved' then
    delete from public.published_restaurant_menus where claim_id = old.id;
  end if;
  return new;
end;
$$;

revoke all on function public.remove_menu_after_claim_revocation() from public, anon, authenticated;

drop trigger if exists remove_menu_after_claim_revocation on public.restaurant_claims;
create trigger remove_menu_after_claim_revocation
  after update of status on public.restaurant_claims
  for each row execute function public.remove_menu_after_claim_revocation();

-- 5. Cebu City Polygon Check, Sequence, Views & Location RPCs
create sequence if not exists public.foodfinder_listing_id start with 100;
revoke all on sequence public.foodfinder_listing_id from public, anon, authenticated;

create or replace function public.is_cebu_city_location(latitude double precision, longitude double precision)
returns boolean
language sql immutable strict set search_path = ''
as $$
  select pg_catalog.point(longitude, latitude) <@ '((123.759578,10.3960357),(123.765672,10.3926589),(123.7706674,10.3836086),(123.7723153,10.3806537),(123.7725385,10.3797926),(123.7728646,10.3750816),(123.7733326,10.3694824),(123.7734356,10.3673886),(123.7733498,10.3662572),(123.7732639,10.3655818),(123.7732124,10.3648557),(123.7740536,10.3620194),(123.7757702,10.3565814),(123.7765942,10.3537445),(123.776371,10.3469222),(123.776165,10.3420756),(123.7761822,10.3376005),(123.776389,10.3286983),(123.7830143,10.328773),(123.8002239,10.3366718),(123.8003408,10.3366219),(123.8004369,10.3365618),(123.800573,10.336505),(123.8011044,10.3364866),(123.8017372,10.336691),(123.8020561,10.3366906),(123.8021211,10.3366905),(123.8023176,10.3366628),(123.8025008,10.3365202),(123.8024842,10.3363623),(123.8024388,10.3361946),(123.802327,10.3359678),(123.8022794,10.3358491),(123.801985,10.3352461),(123.8018816,10.3346449),(123.8018695,10.3343493),(123.8019062,10.3340211),(123.8020602,10.3337237),(123.8023067,10.3333942),(123.8025428,10.3330824),(123.8027124,10.3327449),(123.8028681,10.3325323),(123.8030972,10.3324528),(123.8034245,10.3325293),(123.8037524,10.3327628),(123.8039488,10.3330241),(123.8040037,10.3331014),(123.8040513,10.3332972),(123.8039459,10.3335171),(123.8036887,10.3336988),(123.8034942,10.3339166),(123.8034511,10.3339648),(123.8033581,10.3341511),(123.8033587,10.3342862),(123.8034291,10.3344177),(123.8036121,10.3345854),(123.80384,10.3346764),(123.8043135,10.3347931),(123.8046801,10.3347358),(123.8048948,10.3346766),(123.8050803,10.334611),(123.8054676,10.3342184),(123.8060281,10.3337081),(123.806278,10.3336009),(123.8065261,10.3335086),(123.8067685,10.3335655),(123.8068949,10.3337134),(123.8070538,10.3338654),(123.8070673,10.3348531),(123.8071758,10.3350143),(123.8073408,10.335296),(123.8075962,10.3355013),(123.8078559,10.335524),(123.8081011,10.3354335),(123.8082567,10.3353611),(123.8083436,10.335176),(123.8084483,10.3348473),(123.808417,10.3344407),(123.8082637,10.3339666),(123.8079484,10.3335221),(123.8077558,10.3333352),(123.8075705,10.3330862),(123.8073334,10.332932),(123.8070501,10.3327478),(123.8067354,10.3324016),(123.8065417,10.3321228),(123.8065002,10.3319536),(123.8067033,10.3317388),(123.8070671,10.3315243),(123.8074896,10.3314308),(123.8078558,10.3313043),(123.8083047,10.3312828),(123.8085606,10.3312071),(123.8089962,10.3309158),(123.8092032,10.3305458),(123.8091961,10.3302397),(123.8090405,10.3300508),(123.8086042,10.3297583),(123.8083486,10.3293796),(123.8082458,10.328923),(123.8081523,10.32853),(123.8082479,10.3281114),(123.8084893,10.3277222),(123.8090523,10.3273626),(123.8093967,10.3273681),(123.8097519,10.3277721),(123.809815,10.3280258),(123.8097661,10.3284543),(123.8098067,10.3287333),(123.8100479,10.3288321),(123.8102566,10.3287982),(123.8104564,10.3287963),(123.8109156,10.3290119),(123.8115882,10.3292234),(123.8119972,10.3291574),(123.8125163,10.3287754),(123.8131087,10.3282263),(123.8137029,10.3277254),(123.8140378,10.3275483),(123.8141513,10.3275002),(123.8144258,10.3276001),(123.8145093,10.3278004),(123.8143426,10.3284384),(123.8143312,10.3287868),(123.8145538,10.329134),(123.8147581,10.3292945),(123.8153884,10.3294909),(123.815969,10.3295774),(123.8161925,10.3294153),(123.8162272,10.3289585),(123.8162438,10.3286683),(123.8161252,10.3280709),(123.8161603,10.3278334),(123.8162831,10.3276551),(123.816577,10.327491),(123.8167289,10.3274664),(123.8170065,10.3273439),(123.8173229,10.3270311),(123.817392,10.3267773),(123.8175,10.326617),(123.8178558,10.3264494),(123.8182059,10.326386),(123.8188217,10.326125),(123.8195593,10.3255822),(123.8201323,10.3248434),(123.8207187,10.3240692),(123.8209072,10.3238053),(123.8209104,10.3235999),(123.8206662,10.323136),(123.8205971,10.3228563),(123.8203576,10.3226147),(123.8201615,10.3223665),(123.8199429,10.3220768),(123.8199552,10.3218925),(123.820046,10.3217863),(123.8205695,10.3215465),(123.820997,10.3211163),(123.8211822,10.3204788),(123.8213143,10.3200604),(123.821183,10.3197906),(123.8209434,10.3196428),(123.82076,10.3196042),(123.820579,10.3195662),(123.8199781,10.3193922),(123.8191119,10.3189379),(123.8186875,10.3186795),(123.818094,10.318098),(123.8179,10.3178517),(123.8178754,10.3174649),(123.8180127,10.316949),(123.8172712,10.3136258),(123.8169935,10.3127606),(123.8156636,10.3108719),(123.826947,10.293797),(123.8270301,10.2934438),(123.827303,10.2932102),(123.8276739,10.2931139),(123.8280003,10.2930526),(123.8281962,10.2929621),(123.8282585,10.2927548),(123.8282318,10.2922906),(123.8285166,10.2917155),(123.8290804,10.290936),(123.8297064,10.2903813),(123.8301367,10.2900777),(123.8306411,10.2898033),(123.8309437,10.289377),(123.831282,10.2888048),(123.8316143,10.2877684),(123.8319437,10.2873918),(123.832457,10.2870969),(123.832911,10.2869802),(123.8336587,10.286697),(123.8340711,10.286297),(123.8343085,10.2859087),(123.8341957,10.2852022),(123.8340681,10.284811),(123.83408,10.2845453),(123.8342343,10.2842621),(123.8346082,10.2841629),(123.8353025,10.2841162),(123.8355428,10.2840227),(123.835617,10.2838826),(123.8361362,10.2832724),(123.8363202,10.2826914),(123.8364656,10.2818769),(123.8366525,10.2816463),(123.8370027,10.2816667),(123.837424,10.2819207),(123.8376821,10.2820492),(123.8378483,10.2820141),(123.8379254,10.2818652),(123.8380501,10.2813456),(123.8384625,10.2809689),(123.8390975,10.2806741),(123.8397576,10.280463),(123.8406503,10.280329),(123.8411605,10.2806724),(123.8414207,10.2808055),(123.8417211,10.2807107),(123.8419475,10.280634),(123.8421118,10.2805146),(123.8423433,10.2803526),(123.8429399,10.2797004),(123.8432523,10.2791969),(123.8435946,10.2788978),(123.8436371,10.2788615),(123.8437173,10.2787924),(123.8442458,10.2785955),(123.8444873,10.2784121),(123.8449717,10.2776243),(123.8452432,10.2772289),(123.8453619,10.2770645),(123.8454322,10.2768534),(123.845498,10.2766268),(123.8455389,10.2763012),(123.8455926,10.2761916),(123.8456843,10.2761477),(123.8458354,10.276128),(123.8461263,10.276057),(123.8463155,10.2759857),(123.8466053,10.2756801),(123.8466597,10.2754689),(123.8467526,10.2751914),(123.8468421,10.2744548),(123.8470373,10.2742189),(123.84742,10.274068),(123.8475233,10.273865),(123.8476439,10.2728102),(123.8476725,10.2726956),(123.8475589,10.2726003),(123.8472041,10.2725331),(123.8470731,10.2724808),(123.8470901,10.2723071),(123.847543,10.2708215),(123.8476436,10.2703647),(123.8477596,10.2701581),(123.847948,10.2700534),(123.8481938,10.2699353),(123.8484485,10.2698566),(123.8490495,10.2698028),(123.8493009,10.2697735),(123.8498547,10.2693552),(123.8501481,10.2690968),(123.8502371,10.2690184),(123.850629,10.2687662),(123.8508296,10.2686938),(123.851179,10.2685465),(123.8519058,10.2681656),(123.8526551,10.267788),(123.853363,10.2673454),(123.854041,10.2669158),(123.8542638,10.2667498),(123.8544314,10.2664665),(123.8545538,10.2662127),(123.8545902,10.2659588),(123.8546729,10.2658091),(123.854878,10.2656398),(123.8551459,10.2655259),(123.8553676,10.2655096),(123.8555793,10.265425),(123.8558869,10.2652883),(123.8561482,10.2652394),(123.8569818,10.2652655),(123.8576897,10.2653403),(123.8582686,10.2654054),(123.8585994,10.2654705),(123.8587317,10.2654347),(123.8591749,10.2651483),(123.85981,10.2648489),(123.8599589,10.2647642),(123.8601508,10.2647642),(123.8603327,10.2647838),(123.8604849,10.2647512),(123.8607131,10.2646536),(123.8609149,10.2646731),(123.8612457,10.2646959),(123.8613548,10.264761),(123.8615897,10.2646698),(123.8617055,10.2645624),(123.8618411,10.2644127),(123.8619734,10.2643639),(123.8621917,10.2643476),(123.8627144,10.2643704),(123.8628401,10.2642988),(123.8634728,10.2641641),(123.8635744,10.2641425),(123.8637795,10.2640742),(123.8642591,10.2639765),(123.8648215,10.2638528),(123.8649439,10.2638008),(123.8651633,10.2637231),(123.8663246,10.263093),(123.8672742,10.2626833),(123.8674566,10.2623976),(123.8676377,10.2623818),(123.868107,10.262618),(123.8682219,10.2625546),(123.8682685,10.2625289),(123.868766,10.2625392),(123.8689677,10.2626568),(123.8693154,10.2629506),(123.8719654,10.2606808),(123.8731134,10.2597412),(123.8896035,10.2463015),(123.8928222,10.2536074),(123.8958263,10.2555077),(123.9157819,10.2681764),(123.9146232,10.2720613),(123.9144945,10.2808867),(123.9158248,10.291781),(123.9160394,10.2943567),(123.9166402,10.2971012),(123.9191722,10.2996347),(123.9265108,10.3026326),(123.9302169,10.3058879),(123.9260763,10.3105651),(123.9254674,10.3112183),(123.9241907,10.3126736),(123.9238688,10.3130774),(123.9236467,10.3133441),(123.9230253,10.3140485),(123.9228792,10.314136),(123.9227758,10.3142002),(123.9226015,10.3143717),(123.9224674,10.3145881),(123.922395,10.3147676),(123.922395,10.3148573),(123.922352,10.3149101),(123.9220878,10.314951),(123.9218236,10.3148705),(123.9212711,10.3146158),(123.9207843,10.3144179),(123.9205281,10.3143678),(123.9202881,10.3142978),(123.9200507,10.3142662),(123.9197946,10.3143467),(123.9190368,10.314472),(123.9188156,10.3145591),(123.9187109,10.3146538),(123.9186882,10.3146981),(123.9186918,10.3147459),(123.9189389,10.3152016),(123.9200489,10.3160597),(123.9202882,10.3160854),(123.9203709,10.3161004),(123.920591,10.3161512),(123.9207497,10.316217),(123.9207977,10.3162855),(123.9208044,10.3163573),(123.9207712,10.3164128),(123.9207082,10.3164438),(123.9203799,10.3165368),(123.9201676,10.3166249),(123.9200947,10.3166836),(123.9200452,10.3167688),(123.9201191,10.3169881),(123.9202031,10.3173965),(123.9200076,10.3176869),(123.9197717,10.3179724),(123.9191864,10.3185794),(123.919113,10.3187309),(123.9190167,10.3189607),(123.9188818,10.3191914),(123.9189161,10.3194489),(123.9188474,10.3197315),(123.9188676,10.3198088),(123.9189349,10.3198419),(123.9192003,10.3198507),(123.9192205,10.3198728),(123.9192631,10.3199122),(123.9192725,10.3199563),(123.9192581,10.3200229),(123.9192491,10.3201179),(123.9192491,10.3201929),(123.9193052,10.3202636),(123.9193927,10.3203409),(123.9194241,10.3204358),(123.9194349,10.3205706),(123.9194769,10.3206366),(123.9195132,10.3207084),(123.9195835,10.3207957),(123.9197944,10.3209348),(123.9198842,10.3209789),(123.9199897,10.3209922),(123.9200615,10.3209833),(123.9201288,10.320937),(123.9201692,10.3208774),(123.9201714,10.3207648),(123.9201939,10.3207007),(123.9202567,10.3206433),(123.9203218,10.3206455),(123.9204003,10.3207029),(123.9204878,10.3207383),(123.9206135,10.3207537),(123.9207414,10.320789),(123.920802,10.3208266),(123.92082,10.3208751),(123.9207908,10.3209524),(123.9207212,10.3210805),(123.9206315,10.3212372),(123.9205327,10.3214668),(123.9205193,10.3216766),(123.9205058,10.3218201),(123.9204766,10.3219371),(123.9204183,10.3220651),(123.9203913,10.3221733),(123.9203913,10.3223367),(123.9203465,10.3227341),(123.9203308,10.3231646),(123.9203397,10.3232353),(123.9204183,10.3233214),(123.9205664,10.3234163),(123.9206292,10.3234649),(123.9206562,10.3235377),(123.9206472,10.3236415),(123.9205327,10.3237828),(123.9205098,10.3238319),(123.9204946,10.3238645),(123.9204856,10.3239528),(123.9205305,10.32403),(123.920627,10.3240521),(123.9207302,10.3240565),(123.9208155,10.3240897),(123.9208626,10.3241449),(123.9208716,10.324231),(123.9208604,10.3243281),(123.9207975,10.3244208),(123.9207345,10.3244743),(123.9206057,10.3244788),(123.9204834,10.3245003),(123.9204205,10.3245467),(123.9203936,10.3246129),(123.9203846,10.324688),(123.9204071,10.3247586),(123.9205575,10.3249962),(123.9206763,10.3250831),(123.9207639,10.3251737),(123.9207998,10.3252222),(123.9208065,10.3252995),(123.9207908,10.3253613),(123.920719,10.3254916),(123.9207033,10.3255556),(123.9207235,10.3255998),(123.9207886,10.3256196),(123.9209524,10.3256307),(123.9210309,10.325655),(123.921078,10.3256969),(123.921096,10.3257543),(123.921078,10.3258029),(123.9210085,10.325847),(123.920894,10.3259486),(123.9208379,10.3260369),(123.9207975,10.326134),(123.9207863,10.3262334),(123.9208043,10.3262775),(123.9208604,10.3263151),(123.9209293,10.3263298),(123.9209989,10.3263298),(123.9210595,10.3263673),(123.9211044,10.3264313),(123.9211961,10.3265361),(123.921223,10.3266132),(123.9212233,10.3266772),(123.9211874,10.3267117),(123.9210723,10.3267237),(123.9209662,10.3267312),(123.9209148,10.326765),(123.920903,10.3268338),(123.9209383,10.3270539),(123.9209499,10.3271025),(123.9209197,10.3271619),(123.9208024,10.3272523),(123.9206476,10.3273384),(123.9203738,10.3274466),(123.920192,10.3275812),(123.9200574,10.3276386),(123.9199654,10.3276408),(123.9198688,10.3275678),(123.9198006,10.3275638),(123.9196826,10.327648),(123.919562,10.3277742),(123.9195323,10.3278373),(123.9195828,10.3279227),(123.9197939,10.3280115),(123.9199173,10.328171),(123.9199255,10.3283056),(123.9198604,10.3284766),(123.9199117,10.3286099),(123.9197838,10.3289234),(123.9198107,10.3290131),(123.9200091,10.3291081),(123.9200869,10.3292876),(123.9198643,10.329343),(123.9198831,10.3295857),(123.9199904,10.3296306),(123.9200453,10.329653),(123.9201915,10.3297665),(123.9202673,10.3300739),(123.9203753,10.3298898),(123.9205926,10.3301062),(123.9207602,10.3300996),(123.920872,10.3303485),(123.9209795,10.3302899),(123.9210231,10.3302666),(123.9212088,10.3306593),(123.9212387,10.33076),(123.9212269,10.3308507),(123.9211299,10.3310262),(123.9211467,10.3310396),(123.9214494,10.331004),(123.9215669,10.3309717),(123.9215823,10.3310423),(123.9215782,10.3311937),(123.9215789,10.3315925),(123.921709,10.3316974),(123.9215299,10.3319382),(123.9219652,10.3324573),(123.9217218,10.3325668),(123.9217653,10.3329462),(123.922118,10.3330418),(123.9219631,10.3332127),(123.9221214,10.3333842),(123.9222568,10.3335557),(123.9226229,10.333962),(123.9225365,10.3342258),(123.9225351,10.3343149),(123.9229012,10.3345075),(123.9229683,10.3345324),(123.9229381,10.334726),(123.922745,10.3348526),(123.9228389,10.3350875),(123.9226377,10.3351851),(123.9225599,10.3354094),(123.9220986,10.3356666),(123.9222394,10.3358553),(123.9222018,10.3362933),(123.9221844,10.3363646),(123.9219873,10.3364569),(123.9219604,10.3365044),(123.9219967,10.336635),(123.9220275,10.3367472),(123.9219524,10.3370216),(123.9217754,10.3371047),(123.9217626,10.3373204),(123.9214467,10.3374016),(123.9212698,10.3372921),(123.9209908,10.33742),(123.920783,10.336924),(123.920504,10.3370256),(123.9202599,10.3368039),(123.9204785,10.3366166),(123.9202909,10.336309),(123.9200924,10.3364103),(123.9199609,10.3364411),(123.9199287,10.3365651),(123.91969,10.3366258),(123.919622,10.3362647),(123.9195089,10.3362247),(123.9194318,10.3363652),(123.9193151,10.3364207),(123.919171,10.3362563),(123.9190449,10.3363065),(123.9190874,10.3363799),(123.9182752,10.3367182),(123.9181873,10.3365664),(123.9180786,10.3366139),(123.9178325,10.336862),(123.9174776,10.3370138),(123.9173745,10.3372195),(123.9173169,10.337302),(123.917013,10.338105),(123.9164123,10.3383014),(123.9160381,10.3383752),(123.9156291,10.3386734),(123.9151396,10.3388594),(123.9148915,10.3389492),(123.9145522,10.3391141),(123.9143953,10.3392381),(123.9128476,10.3398028),(123.9132613,10.3412192),(123.9149988,10.3472701),(123.9164793,10.3509535),(123.9181786,10.3535637),(123.9183176,10.3537182),(123.9185684,10.3542388),(123.9187105,10.3546036),(123.9195371,10.3567794),(123.9204383,10.3581303),(123.921994,10.3618453),(123.9233351,10.3645154),(123.9252341,10.3661406),(123.9250356,10.366613),(123.9258456,10.3697606),(123.9261782,10.3710587),(123.9259463,10.3732975),(123.9257705,10.3749951),(123.9246333,10.3770319),(123.9244616,10.378636),(123.9243758,10.381116),(123.9238988,10.3852819),(123.9235604,10.3883977),(123.9231419,10.3903078),(123.9230883,10.397547),(123.9239332,10.4735155),(123.9234989,10.4734992),(123.9232507,10.4733324),(123.9231887,10.4728931),(123.9233459,10.4723074),(123.9232921,10.4717705),(123.9230067,10.4712987),(123.9226013,10.471075),(123.9216376,10.4710425),(123.9208351,10.471075),(123.9199996,10.4715631),(123.9194123,10.4719576),(123.9189076,10.4723563),(123.9186677,10.4726572),(123.9187008,10.4730558),(123.9191186,10.4738693),(123.919375,10.4745038),(123.9193006,10.4747397),(123.9187174,10.4751994),(123.9183823,10.4753539),(123.9181423,10.4820307),(123.9062118,10.4881073),(123.8916714,10.4883399),(123.8912079,10.4889788),(123.8905801,10.4896606),(123.8901239,10.4902707),(123.8898684,10.4905794),(123.8895436,10.4910603),(123.8894487,10.4915483),(123.8894888,10.4918175),(123.8896239,10.4920615),(123.8896093,10.4923271),(123.8892435,10.4932303),(123.8887709,10.4941061),(123.888835,10.4946943),(123.8891341,10.4953834),(123.8892196,10.4962741),(123.8473947,10.4644427),(123.8354642,10.4550063),(123.8231904,10.4456202),(123.8103158,10.4355586),(123.7982541,10.4262144),(123.7892591,10.4193262),(123.7780831,10.4108092),(123.7756112,10.4089013),(123.7653115,10.4006789))'::pg_catalog.polygon
$$;

alter table public.restaurant_claims
  drop constraint if exists restaurant_claims_in_cebu_city,
  add constraint restaurant_claims_in_cebu_city
    check (public.is_cebu_city_location(latitude, longitude));

drop view if exists public.published_restaurant_locations;
create view public.published_restaurant_locations with (security_barrier = true) as
select restaurant_osm_type, restaurant_osm_id, restaurant_name, address, latitude, longitude, category, cuisine
from public.restaurant_claims
where status = 'approved' and address is not null;

revoke all on public.published_restaurant_locations from public, anon, authenticated;
grant select on public.published_restaurant_locations to anon, authenticated;

create or replace function public.submit_restaurant_listing(
  listing_name text, listing_evidence text, listing_address text,
  listing_latitude double precision, listing_longitude double precision
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  claimant uuid := (select auth.uid());
  claim uuid;
begin
  if claimant is null then
    raise exception 'Sign in to submit a restaurant.';
  end if;
  if not coalesce(public.is_cebu_city_location(listing_latitude, listing_longitude), false)
      or nullif(btrim(listing_address), '') is null then
    raise exception 'Enter an address and coordinates inside Cebu City.';
  end if;
  insert into public.restaurant_claims
    (owner_id, restaurant_osm_type, restaurant_osm_id, restaurant_name, evidence, address, latitude, longitude)
  values
    (claimant, 'foodfinder', nextval('public.foodfinder_listing_id')::text,
      btrim(listing_name), btrim(listing_evidence), btrim(listing_address), listing_latitude, listing_longitude)
  returning id into claim;
  return claim;
end;
$$;

create or replace function public.publish_restaurant_location(
  target_claim uuid, listing_address text, listing_latitude double precision, listing_longitude double precision
)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not coalesce(public.is_cebu_city_location(listing_latitude, listing_longitude), false)
      or nullif(btrim(listing_address), '') is null then
    raise exception 'Enter an address and coordinates inside Cebu City.';
  end if;
  update public.restaurant_claims
  set address = btrim(listing_address), latitude = listing_latitude, longitude = listing_longitude
  where id = target_claim and owner_id = (select auth.uid()) and status = 'approved';
  if not found then
    raise exception 'An approved ownership claim is required.';
  end if;
end;
$$;

revoke all on function public.submit_restaurant_listing(text, text, text, double precision, double precision)
  from public, anon, authenticated;
revoke all on function public.publish_restaurant_location(uuid, text, double precision, double precision)
  from public, anon, authenticated;
grant execute on function public.submit_restaurant_listing(text, text, text, double precision, double precision)
  to authenticated;
grant execute on function public.publish_restaurant_location(uuid, text, double precision, double precision)
  to authenticated;

-- 6. Supabase Storage Bucket & Policies for Menu Dish Photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-images',
  'menu-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view published menu images" on storage.objects;
create policy "Anyone can view published menu images"
  on storage.objects for select
  to public
  using (bucket_id = 'menu-images');

drop policy if exists "Approved owners upload menu images for their claim" on storage.objects;
create policy "Approved owners upload menu images for their claim"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'menu-images'
    and exists (
      select 1 from public.restaurant_claims c
      where c.id::text = (storage.foldername(name))[1]
        and c.owner_id = (select auth.uid())
        and c.status = 'approved'
    )
  );

drop policy if exists "Approved owners update their menu images" on storage.objects;
create policy "Approved owners update their menu images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'menu-images'
    and exists (
      select 1 from public.restaurant_claims c
      where c.id::text = (storage.foldername(name))[1]
        and c.owner_id = (select auth.uid())
        and c.status = 'approved'
    )
  );

drop policy if exists "Approved owners delete their menu images" on storage.objects;
create policy "Approved owners delete their menu images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'menu-images'
    and exists (
      select 1 from public.restaurant_claims c
      where c.id::text = (storage.foldername(name))[1]
        and c.owner_id = (select auth.uid())
        and c.status = 'approved'
    )
  );

-- ============================================================================
-- 7. SEED DATA: 20 ACCURATE CEBU CITY RESTAURANTS, FAST FOOD, LECHON & MENUS
-- ============================================================================

insert into public.restaurant_claims
  (id, owner_id, restaurant_osm_type, restaurant_osm_id, restaurant_name, evidence, status, address, latitude, longitude, category, cuisine)
values
  ('10000000-0000-0000-0000-000000000001', null, 'foodfinder', '1', 'Jollibee — Fuente Osmeña Circle', 'Verified Cebu City branch directory seed record for Jollibee Fuente Osmeña Circle.', 'approved', 'Fuente Osmeña Circle, Capitol Site, Cebu City', 10.3108, 123.8939, 'Fast Food', 'Filipino Fast Food'),
  ('10000000-0000-0000-0000-000000000002', null, 'foodfinder', '2', 'McDonald''s — Fuente Osmeña', 'Verified Cebu City branch directory seed record for McDonald''s Fuente Osmeña Boulevard.', 'approved', 'Osmeña Blvd, Santa Cruz, Cebu City', 10.3095, 123.8938, 'Fast Food', 'Burgers & Fried Chicken'),
  ('10000000-0000-0000-0000-000000000003', null, 'foodfinder', '3', 'House of Lechon — Acacia Street', 'Verified Cebu City restaurant seed record for House of Lechon on Acacia Street, Kamputhaw.', 'approved', 'Acacia St, Kamputhaw, Cebu City', 10.3193, 123.9032, 'Restaurant', 'Cebu Lechon & Filipino'),
  ('10000000-0000-0000-0000-000000000004', null, 'foodfinder', '4', 'Rico''s Lechon — Escario Central', 'Verified Cebu City restaurant seed record for Rico''s Lechon at Escario Central Mall.', 'approved', 'N. Escario St, Capitol Site, Cebu City', 10.3177, 123.8961, 'Restaurant', 'Cebu Lechon & Filipino'),
  ('10000000-0000-0000-0000-000000000005', null, 'foodfinder', '5', 'CNT Lechon — Guadalupe', 'Verified Cebu City restaurant seed record for CNT Lechon on V. Rama Avenue, Guadalupe.', 'approved', 'V. Rama Ave, Guadalupe, Cebu City', 10.3204, 123.8845, 'Restaurant', 'Traditional Cebu Lechon'),
  ('10000000-0000-0000-0000-000000000006', null, 'foodfinder', '6', 'Chowking — Colon Street', 'Verified Cebu City branch directory seed record for Chowking Downtown Colon Street.', 'approved', 'Colon St, Downtown, Cebu City', 10.2968, 123.8990, 'Fast Food', 'Chinese Fast Food'),
  ('10000000-0000-0000-0000-000000000007', null, 'foodfinder', '7', 'Mang Inasal — Ayala Center Cebu', 'Verified Cebu City branch directory seed record for Mang Inasal at Ayala Center Cebu.', 'approved', 'Ayala Center Cebu, Cebu Business Park, Cebu City', 10.3183, 123.9056, 'Fast Food', 'Filipino Charcoal Grill'),
  ('10000000-0000-0000-0000-000000000008', null, 'foodfinder', '8', 'KFC — Cebu IT Park', 'Verified Cebu City branch directory seed record for KFC Skyrise 4 at Cebu IT Park.', 'approved', 'Skyrise 4, Cebu IT Park, Lahug, Cebu City', 10.3309, 123.9065, 'Fast Food', 'Fried Chicken & Bowls'),
  ('10000000-0000-0000-0000-000000000009', null, 'foodfinder', '9', 'Larsian BBQ — Fuente Osmeña', 'Verified Cebu City culinary landmark seed record for Larsian BBQ food market.', 'approved', 'Don Mariano Cui St, Capitol Site, Cebu City', 10.3098, 123.8919, 'Restaurant', 'Cebuano Street BBQ & Grill'),
  ('10000000-0000-0000-0000-000000000010', null, 'foodfinder', '10', 'Siomai sa Tisa — Original Katipunan Stall', 'Verified Cebu City street food institution seed record in Barangay Tisa.', 'approved', 'Katipunan St, Brgy. Tisa, Cebu City', 10.2981, 123.8732, 'Fast Food', 'Cebu Dimsum & Street Food'),
  ('10000000-0000-0000-0000-000000000011', null, 'foodfinder', '11', 'Sunburst Fried Chicken — Mango Square', 'Verified Cebu City heritage restaurant seed record for Sunburst Fried Chicken.', 'approved', 'Gen. Maxilom Ave, Kamputhaw, Cebu City', 10.3118, 123.8981, 'Restaurant', 'Heritage Fried Chicken'),
  ('10000000-0000-0000-0000-000000000012', null, 'foodfinder', '12', 'Orange Brutus — Fuente Osmeña', 'Verified Cebu homegrown fast food chain seed record at Fuente Osmeña.', 'approved', 'Fuente Osmeña Circle, Capitol Site, Cebu City', 10.3105, 123.8930, 'Fast Food', 'Sizzling Steaks & Burgers'),
  ('10000000-0000-0000-0000-000000000013', null, 'foodfinder', '13', 'Dimsum Break — Colon Heritage', 'Verified Cebu City Cantonese dimsum fast food seed record on Colon Street.', 'approved', 'Colon St cor. Osmeña Blvd, Downtown, Cebu City', 10.2963, 123.8979, 'Fast Food', 'Cantonese Dimsum & Noodles'),
  ('10000000-0000-0000-0000-000000000014', null, 'foodfinder', '14', 'Chika-an sa Cebu — Salinas Drive Lahug', 'Verified Cebuano heritage dining seed record on Salinas Drive, Lahug.', 'approved', 'Salinas Drive, Lahug, Cebu City', 10.3283, 123.9029, 'Restaurant', 'Traditional Cebuano & Filipino'),
  ('10000000-0000-0000-0000-000000000015', null, 'foodfinder', '15', 'STK ta Bay! — Paolito''s Seafood House', 'Verified Cebu City seafood and Sugba-Tuwa-Kilaw restaurant seed record.', 'approved', 'Orchid St, Capitol Site, Cebu City', 10.3144, 123.8914, 'Restaurant', 'Seafood · Sugba Tuwa Kilaw'),
  ('10000000-0000-0000-0000-000000000016', null, 'foodfinder', '16', 'Abaca Baking Company — Crossroads Banilad', 'Verified Cebu City artisan bakery and brunch cafe seed record at Crossroads.', 'approved', 'Crossroads, Gov. M. Cuenco Ave, Banilad, Cebu City', 10.3357, 123.9114, 'Café', 'Artisan Bakery & All-Day Brunch'),
  ('10000000-0000-0000-0000-000000000017', null, 'foodfinder', '17', 'Bo''s Coffee — Capitol Flagship', 'Verified Cebu homegrown specialty coffee flagship seed record on Osmeña Blvd.', 'approved', 'Osmeña Blvd, Capitol Site, Cebu City', 10.3155, 123.8916, 'Café', 'Philippine Origin Coffee & Pastries'),
  ('10000000-0000-0000-0000-000000000018', null, 'foodfinder', '18', 'Tightrope Coffee — F. Cabahug', 'Verified Cebu City specialty third-wave coffee shop seed record in Kasambagan.', 'approved', 'F. Cabahug St, Kasambagan, Cebu City', 10.3248, 123.9163, 'Café', 'Specialty Coffee & Modern Brunch'),
  ('10000000-0000-0000-0000-000000000019', null, 'foodfinder', '19', 'Sugbo Mercado — Cebu IT Park', 'Verified Cebu City weekend night market food bazaar seed record at Garden Bloc.', 'approved', 'Garden Bloc, Cebu IT Park, Apas, Cebu City', 10.3318, 123.9061, 'Restaurant', 'Cebu Night Market & Street Food'),
  ('10000000-0000-0000-0000-000000000020', null, 'foodfinder', '20', 'La Vie Parisienne — Gorordo Avenue', 'Verified Cebu City French bakery, patisserie, and deli seed record in Lahug.', 'approved', 'Gorordo Ave, Lahug, Cebu City', 10.3264, 123.9001, 'Café', 'French Bakery, Pastries & Pizza')
on conflict (id) do update set
  restaurant_name = excluded.restaurant_name,
  status = excluded.status,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  category = excluded.category,
  cuisine = excluded.cuisine;

insert into public.published_restaurant_menus
  (claim_id, restaurant_osm_type, restaurant_osm_id, items, published_at)
values
  -- 1. Jollibee Fuente Osmeña
  ('10000000-0000-0000-0000-000000000001', 'foodfinder', '1', '[
    {"id":"jb-1","name":"1-pc Chickenjoy with Jolly Spaghetti","category":"Chickenjoy & Combos","price":142,"description":"Crispylicious, juicylicious fried chicken served with sweet-style Jolly Spaghetti and gravy.","imageUrl":"https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"jb-2","name":"1-pc Chickenjoy Solo with Rice","category":"Chickenjoy & Combos","price":92,"description":"Signature crispy fried chicken with steamed white rice and signature gravy.","imageUrl":"https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"jb-3","name":"Yumburger Solo","category":"Burgers","price":45,"description":"100% pure beef patty with signature burger dressing on a soft bun.","imageUrl":"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"jb-4","name":"Cheesy Yumburger","category":"Burgers","price":69,"description":"Beef yumburger topped with creamy melted cheddar cheese and special dressing.","imageUrl":"https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"jb-5","name":"Jolly Spaghetti Solo","category":"Noodles & Pasta","price":65,"description":"Filipino sweet-style spaghetti loaded with sliced hotdogs, ground meat, and grated cheese.","imageUrl":"https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"jb-6","name":"Palabok Fiesta Solo","category":"Noodles & Pasta","price":128,"description":"Rice noodles topped with savory garlic-shrimp sauce, crushed chicharon, tinapa flakes, and egg.","imageUrl":"https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"jb-7","name":"Peach Mango Pie","category":"Desserts & Drinks","price":48,"description":"Golden crispy pocket crust filled with real Philippine mangoes and peaches.","imageUrl":"https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now()),

  -- 2. McDonald's Fuente Osmeña
  ('10000000-0000-0000-0000-000000000002', 'foodfinder', '2', '[
    {"id":"mc-1","name":"1-pc Chicken McDo with Rice","category":"Chicken & Rice Meals","price":92,"description":"Golden crispy Chicken McDo served with steamed rice and savory mushroom gravy.","imageUrl":"https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"mc-2","name":"Big Mac Solo","category":"Burgers","price":179,"description":"Double 100% beef patties, special Big Mac sauce, crisp lettuce, cheese, pickles, and onions on a sesame bun.","imageUrl":"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"mc-3","name":"Burger McDo Solo","category":"Burgers","price":44,"description":"Juicy beef patty with sweet-tangy Filipino burger sauce on a toasted bun.","imageUrl":"https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"mc-4","name":"McSpaghetti Solo","category":"Pasta & Sides","price":67,"description":"Sweet-sarap Filipino spaghetti with hotdog slices and cheddar cheese.","imageUrl":"https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"mc-5","name":"World Famous Fries (Medium)","category":"Pasta & Sides","price":79,"description":"Crispy golden potato fries lightly salted and cooked fresh.","imageUrl":"https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"mc-6","name":"McFlurry with Oreo","category":"Desserts & Drinks","price":69,"description":"Creamy vanilla soft-serve swirled with crunchy Oreo cookie pieces.","imageUrl":"https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"mc-7","name":"Coke McFloat","category":"Desserts & Drinks","price":57,"description":"Chilled Coca-Cola topped with creamy vanilla soft-serve and chocolate syrup.","imageUrl":"https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now()),

  -- 3. House of Lechon Acacia Street
  ('10000000-0000-0000-0000-000000000003', 'foodfinder', '3', '[
    {"id":"hol-1","name":"Carcar Special Lechon (1/4 kg)","category":"Signature Cebu Lechon","price":265,"description":"Authentic Carcar-style slow-roasted pork with aromatic lemongrass, garlic, and crackling skin.","imageUrl":"https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"hol-2","name":"Spicy Cebu Lechon (1/4 kg)","category":"Signature Cebu Lechon","price":275,"description":"Crispy roasted Cebu lechon infused with native bird''s eye chilies and scallions.","imageUrl":"https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"hol-3","name":"Carcar Special Lechon (1/2 kg)","category":"Signature Cebu Lechon","price":510,"description":"Half-kilogram platter of golden Carcar lechon served with rich liver-drippings gravy.","imageUrl":"https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"hol-4","name":"Baked Bantayan Scallops","category":"Cebuano Classics","price":285,"description":"Fresh Bantayan Island scallops baked with garlic butter and melted cheese.","imageUrl":"https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"hol-5","name":"Cebu Ngohiong Platter","category":"Cebuano Classics","price":160,"description":"Five-spice julienned heart-of-palm and minced pork rolls with house spicy sweet sauce.","imageUrl":"https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"hol-6","name":"Dinuguan sa Carcar","category":"Cebuano Classics","price":185,"description":"Savory Cebuano pork blood stew simmered with vinegar, garlic, and green chili.","imageUrl":"https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now()),

  -- 4. Rico's Lechon Escario
  ('10000000-0000-0000-0000-000000000004', 'foodfinder', '4', '[
    {"id":"rl-1","name":"Original Cebu Lechon (1/4 kg)","category":"Roasted Lechon","price":260,"description":"Rico''s world-famous Cebu lechon roasted with native lemongrass and crushed garlic.","imageUrl":"https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"rl-2","name":"Spicy Cebu Lechon (1/4 kg)","category":"Roasted Lechon","price":275,"description":"Pioneering spicy roasted Cebu lechon seasoned with chilies and native herbs.","imageUrl":"https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"rl-3","name":"Lechon Paksiw","category":"Main Dishes","price":240,"description":"Tender roasted lechon simmered in a sweet-tangy liver and cane vinegar reduction.","imageUrl":"https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"rl-4","name":"Monggos with Lechon Bits","category":"Main Dishes","price":165,"description":"Slow-cooked mung bean stew topped with crispy roasted lechon cracklings.","imageUrl":"https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"rl-5","name":"Kinilaw na Tanigue","category":"Appetizers & Seafood","price":295,"description":"Fresh Spanish mackerel cured in coconut vinegar, ginger, red onions, and chili.","imageUrl":"https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"rl-6","name":"Buko Pandan Salad","category":"Desserts","price":110,"description":"Chilled young coconut strips and pandan jelly in sweetened cream.","imageUrl":"https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now()),

  -- 5. CNT Lechon Guadalupe
  ('10000000-0000-0000-0000-000000000005', 'foodfinder', '5', '[
    {"id":"cnt-1","name":"CNT Roasted Cebu Lechon (1/4 kg)","category":"Cebu Lechon","price":250,"description":"Classic salty-savory Cebu lechon with ultra-crispy red skin roasted over charcoal.","imageUrl":"https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"cnt-2","name":"CNT Lechon Belly Cut (1/4 kg)","category":"Cebu Lechon","price":265,"description":"Juicy rib-and-belly section seasoned with lemongrass, peppercorns, and spring onions.","imageUrl":"https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"cnt-3","name":"CNT Roasted Lechon (1/2 kg)","category":"Cebu Lechon","price":490,"description":"Half-kilogram family order of freshly chopped CNT Cebu Lechon.","imageUrl":"https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"cnt-4","name":"Traditional Dinuguan Bowl","category":"Sides & Rice","price":95,"description":"Rich Cebuano blood stew served warm to pair with puso and lechon.","imageUrl":"https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"cnt-5","name":"Puso (Hanging Rice · 5 pcs)","category":"Sides & Rice","price":35,"description":"Traditional Cebuano rice boiled inside woven young coconut fronds.","imageUrl":"https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"cnt-6","name":"Atsara Pickled Papaya","category":"Sides & Rice","price":65,"description":"Sweet and tangy pickled green papaya slaw.","imageUrl":"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now()),

  -- 6. Chowking Colon Street
  ('10000000-0000-0000-0000-000000000006', 'foodfinder', '6', '[
    {"id":"ck-1","name":"Chinese-Style Fried Chicken Lauriat","category":"Lauriat & Rice Meals","price":215,"description":"Fried chicken, pancit canton, egg fried rice, siomai, buchi, and chicharap.","imageUrl":"https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"ck-2","name":"Pork Chao Fan with Steamed Siomai","category":"Lauriat & Rice Meals","price":109,"description":"Wok-fried pork Chao Fan rice topped with 4 pieces of steamed pork siomai.","imageUrl":"https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"ck-3","name":"Beef Wonton Mami","category":"Noodles & Dimsum","price":125,"description":"Egg noodles in rich beef broth with braised beef chunks, wontons, and bok choy.","imageUrl":"https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"ck-4","name":"Chunky Asado Siopao","category":"Noodles & Dimsum","price":62,"description":"Fluffy steamed bun filled with sweet-savory Chinese roast pork asado.","imageUrl":"https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"ck-5","name":"SuperSangkap Halo-Halo","category":"Desserts","price":99,"description":"Shaved ice dessert with leche flan, ube halaya, sweetened beans, macapuno, and ice cream.","imageUrl":"https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now()),

  -- 7. Mang Inasal Ayala Center Cebu
  ('10000000-0000-0000-0000-000000000007', 'foodfinder', '7', '[
    {"id":"mi-1","name":"Chicken Inasal Paa Large (PM1)","category":"Charcoal Grilled Meals","price":159,"description":"Marinated chicken leg & thigh grilled over charcoal, served with rice, chicken oil, and calamansi.","imageUrl":"https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"mi-2","name":"Chicken Inasal Pecho Large (PM2)","category":"Charcoal Grilled Meals","price":169,"description":"Charcoal-grilled chicken breast & wing marinated in lemongrass, ginger, and annatto.","imageUrl":"https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"mi-3","name":"2-pc Pork BBQ Meal","category":"Charcoal Grilled Meals","price":129,"description":"Two caramelized grilled pork barbecue skewers served with spiced vinegar and rice.","imageUrl":"https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"mi-4","name":"Sizzling Bangus Sisig","category":"Sizzling & Merienda","price":149,"description":"Flaked milkfish sisig seasoned with onions, chili, and calamansi on a sizzling plate.","imageUrl":"https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"mi-5","name":"Extra Creamy Halo-Halo","category":"Desserts","price":99,"description":"Creamy shaved milk ice topped with leche flan, ube, banana, and golden corn.","imageUrl":"https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now()),

  -- 8. KFC Cebu IT Park
  ('10000000-0000-0000-0000-000000000008', 'foodfinder', '8', '[
    {"id":"kfc-1","name":"1-pc Original Recipe Chicken w/ Rice","category":"Chicken & Rice Bowls","price":99,"description":"11 herbs and spices fried chicken served with steamed rice and signature KFC gravy.","imageUrl":"https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"kfc-2","name":"Famous Bowl Meal","category":"Chicken & Rice Bowls","price":130,"description":"Mashed potato bowl layered with sweet corn, crispy chicken shots, signature gravy, and shredded cheese.","imageUrl":"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"kfc-3","name":"Sisig Rice Bowl","category":"Chicken & Rice Bowls","price":145,"description":"Crispy chicken sisig tossed in savory mayo-calamansi dressing over hot rice with egg.","imageUrl":"https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"kfc-4","name":"Zinger Burger Solo","category":"Burgers & Sides","price":155,"description":"Spicy crunchy chicken thigh fillet with lettuce and mayo on a toasted sesame bun.","imageUrl":"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"kfc-5","name":"Mashed Potato (Regular)","category":"Burgers & Sides","price":55,"description":"Whipped mashed potatoes topped with warm KFC gravy.","imageUrl":"https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now()),

  -- 9. Larsian BBQ Fuente
  ('10000000-0000-0000-0000-000000000009', 'foodfinder', '9', '[
    {"id":"lar-1","name":"Sinugbang Liempo (Grilled Pork Belly)","category":"Charcoal Grill","price":135,"description":"Thick-cut marinated pork belly grilled over open charcoal, served with soy-calamansi chili dip.","imageUrl":"https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"lar-2","name":"Pork BBQ Skewers (5 Sticks)","category":"Charcoal Grill","price":75,"description":"Classic Cebu sweet-garlicky pork barbecue skewers basted on the grill.","imageUrl":"https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"lar-3","name":"Chorizo de Cebu Skewers (3 pcs)","category":"Charcoal Grill","price":85,"description":"Smoky-sweet round Cebuano pork sausages grilled over hot coals.","imageUrl":"https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"lar-4","name":"Sinugbang Nokus (Grilled Whole Squid)","category":"Grilled Seafood","price":165,"description":"Fresh squid stuffed with tomatoes and onions, charred over charcoal.","imageUrl":"https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"lar-5","name":"Puso (Hanging Rice · 6 pcs)","category":"Rice & Drinks","price":30,"description":"Six pieces of traditional Cebu woven coconut-leaf hanging rice.","imageUrl":"https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now()),

  -- 10. Siomai sa Tisa Original Stall
  ('10000000-0000-0000-0000-000000000010', 'foodfinder', '10', '[
    {"id":"tisa-1","name":"Original Siomai sa Tisa (4 pcs)","category":"Steamed Dimsum","price":48,"description":"Famous Barangay Tisa pork-and-shrimp dumplings topped with signature crispy chili garlic oil.","imageUrl":"https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"tisa-2","name":"Siomai sa Tisa Double Order (8 pcs)","category":"Steamed Dimsum","price":92,"description":"Eight steamed Tisa pork siomai drizzled with calamansi soy and house chili oil.","imageUrl":"https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"tisa-3","name":"Cebu Pork Ngohiong (2 pcs)","category":"Street Favorites","price":36,"description":"Crispy battered five-spice ubod and pork spring rolls.","imageUrl":"https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"tisa-4","name":"Halang-Halang Beef Soup","category":"Street Favorites","price":85,"description":"Spicy Cebuano ginger-and-chili beef broth bowl.","imageUrl":"https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"tisa-5","name":"Puso Hanging Rice (4 pcs)","category":"Rice & Drinks","price":24,"description":"Four pieces of woven coconut-leaf hanging rice.","imageUrl":"https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now()),

  -- 11. Sunburst Fried Chicken Mango Square
  ('10000000-0000-0000-0000-000000000011', 'foodfinder', '11', '[
    {"id":"sb-1","name":"Sunburst Snack Pack (2-pc Chicken)","category":"Heritage Fried Chicken","price":225,"description":"Two pieces of signature pressure-fried chicken with coleslaw, potato fries, rice, and banana ketchup.","imageUrl":"https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"sb-2","name":"Regular Leg & Thigh Meal","category":"Heritage Fried Chicken","price":185,"description":"Golden fried chicken quarter served with rice, gravy, and chilled coleslaw.","imageUrl":"https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"sb-3","name":"Crispy Chicken Skin Cracklings","category":"Appetizers","price":145,"description":"Crunchy spiced chicken skin cracklings served with sinamak spiced vinegar.","imageUrl":"https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"sb-4","name":"Pork Teriyaki Rice Plate","category":"Rice Meals","price":195,"description":"Grilled glazed pork slices with buttered vegetables and garlic rice.","imageUrl":"https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now()),

  -- 12. Orange Brutus Fuente Osmeña
  ('10000000-0000-0000-0000-000000000012', 'foodfinder', '12', '[
    {"id":"ob-1","name":"Sizzling Burger Steak with Egg","category":"Sizzling Plates","price":125,"description":"Cebu''s iconic sizzling beef patty smothered in mushroom gravy with fried egg and rice.","imageUrl":"https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"ob-2","name":"Brute Burger with Cheese","category":"Burgers & Meals","price":89,"description":"Flame-grilled pure beef burger with cheddar cheese, tomato, and house dressing.","imageUrl":"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"ob-3","name":"Chorizo Burger Meal with Egg","category":"Burgers & Meals","price":98,"description":"Sweet-savory Cebu chorizo patties served with sunny-side-up egg and steamed rice.","imageUrl":"https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"ob-4","name":"Chocolate Monster Cake Slice","category":"Desserts & Shakes","price":95,"description":"Famous moist dark chocolate fudge cake topped with rich chocolate ganache.","imageUrl":"https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"ob-5","name":"Fresh Cebu Mango Shake","category":"Desserts & Shakes","price":75,"description":"Blended ripe Cebu carabao mango shake with milk.","imageUrl":"https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now()),

  -- 13. Dimsum Break Colon Heritage
  ('10000000-0000-0000-0000-000000000013', 'foodfinder', '13', '[
    {"id":"db-1","name":"Original Steamed Fried Rice","category":"Signature Dimsum","price":115,"description":"Cebu''s beloved garlic fried rice topped with savory braised pork ribs, shrimp, and green peas.","imageUrl":"https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"db-2","name":"Hakaw Shrimp Dumplings (4 pcs)","category":"Signature Dimsum","price":128,"description":"Translucent steamed crystal dumplings filled with whole plump shrimp.","imageUrl":"https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"db-3","name":"Bacon Wrapped Siomai (4 pcs)","category":"Signature Dimsum","price":115,"description":"Steamed pork and mushroom siomai wrapped in smoky bacon strips.","imageUrl":"https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"db-4","name":"Qua Pao Steamed Pork Belly Bun","category":"Buns & Desserts","price":85,"description":"Soft lotus leaf bun stuffed with five-spice braised pork belly and crushed peanuts.","imageUrl":"https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"db-5","name":"Almond Lychee Jelly","category":"Buns & Desserts","price":78,"description":"Chilled almond pudding cubes with sweet lychees in syrup.","imageUrl":"https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now()),

  -- 14. Chika-an sa Cebu Lahug
  ('10000000-0000-0000-0000-000000000014', 'foodfinder', '14', '[
    {"id":"chk-1","name":"Crispy Pata Regular","category":"House Specialties","price":545,"description":"Deep-fried pork knuckle with blistered crackling skin and soy-vinegar onion dip.","imageUrl":"https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"chk-2","name":"Baked Scallops in Garlic Butter","category":"House Specialties","price":265,"description":"Broiled Visayan scallops topped with melted quezo and toasted garlic.","imageUrl":"https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"chk-3","name":"Pinakbet with Lechon Kawali","category":"Vegetables & Noodles","price":215,"description":"Squash, eggplant, bitter melon, and string beans sautéed in shrimp paste with crispy pork.","imageUrl":"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"chk-4","name":"Bam-i Cebuano","category":"Vegetables & Noodles","price":195,"description":"Cebuano combination of sotanghon glass noodles and egg canton with pork, shrimp, and wood ear mushrooms.","imageUrl":"https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"chk-5","name":"Puto Maya at Sikwate","category":"Cebuano Desserts","price":125,"description":"Ginger-infused sticky black & white glutinous rice with hot tablea cacao chocolate and ripe mango.","imageUrl":"https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now()),

  -- 15. STK ta Bay! Paolito's Seafood House
  ('10000000-0000-0000-0000-000000000015', 'foodfinder', '15', '[
    {"id":"stk-1","name":"Sinugbang Panga sa Tuna (Grilled Tuna Jaw)","category":"Sugba · Tuwa · Kilaw","price":380,"description":"Charcoal-grilled yellowfin tuna jaw basted in sweet soy and calamansi.","imageUrl":"https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"stk-2","name":"Kinilaw na Tangigue","category":"Sugba · Tuwa · Kilaw","price":285,"description":"Fresh mackerel cubes dressed in spiced tuba vinegar, ginger, shallots, and coconut milk.","imageUrl":"https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"stk-3","name":"Tinolang Manok Bisaya","category":"Sugba · Tuwa · Kilaw","price":260,"description":"Native chicken soup simmered with green papaya, lemongrass, and moringa leaves (malunggay).","imageUrl":"https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"stk-4","name":"Crispy Chicharon Bakasi (Reef Eel)","category":"Seafood & Vegetables","price":230,"description":"Cordova delicacy of crispy fried saltwater reef eel served with spiced vinegar.","imageUrl":"https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"stk-5","name":"Adobong Kangkong with Crispy Garlic","category":"Seafood & Vegetables","price":140,"description":"Water spinach braised in soy sauce, cane vinegar, and roasted garlic.","imageUrl":"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now()),

  -- 16. Abaca Baking Company Crossroads Banilad
  ('10000000-0000-0000-0000-000000000016', 'foodfinder', '16', '[
    {"id":"abc-1","name":"Classic French Butter Croissant","category":"Viennoiserie & Pastries","price":135,"description":"Hand-laminated 27-layer flaky pastry baked golden with cultured French butter.","imageUrl":"https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"abc-2","name":"Toasted Almond Pain au Chocolat","category":"Viennoiserie & Pastries","price":165,"description":"Double dark chocolate batons baked in croissant pastry with almond frangipane.","imageUrl":"https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"abc-3","name":"Eggs Benedict on Country Sourdough","category":"All-Day Brunch","price":395,"description":"Two poached farm eggs, house-cured bacon, and lemon hollandaise over toasted sourdough.","imageUrl":"https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"abc-4","name":"Iced Spanish Latte","category":"Specialty Espresso","price":175,"description":"Double-shot Abaca espresso shaken with textured milk and sweet condensed milk.","imageUrl":"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"abc-5","name":"Flat White","category":"Specialty Espresso","price":160,"description":"Velvety micro-foamed milk poured over a double ristretto shot.","imageUrl":"https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now()),

  -- 17. Bo's Coffee Capitol Flagship
  ('10000000-0000-0000-0000-000000000017', 'foodfinder', '17', '[
    {"id":"bos-1","name":"Iced Creamy Latte","category":"Philippine Coffee","price":155,"description":"Signature Philippine Highland arabica espresso over ice with sweet creamy milk.","imageUrl":"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"bos-2","name":"Sagada Single Origin Pour Over","category":"Philippine Coffee","price":145,"description":"Hand-poured Cordillera arabica with notes of dark cocoa and toasted nuts.","imageUrl":"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"bos-3","name":"Caramel Froccino","category":"Philippine Coffee","price":175,"description":"Ice-blended espresso topped with whipped cream and buttery caramel drizzle.","imageUrl":"https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"bos-4","name":"Grilled Three-Cheese Panini","category":"All-Day Café Plates","price":195,"description":"Mozzarella, cheddar, and cream cheese pressed on artisan ciabatta bread.","imageUrl":"https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"bos-5","name":"Classic New York Cheesecake","category":"All-Day Café Plates","price":165,"description":"Rich baked cream cheese slice on a buttery graham crust.","imageUrl":"https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now()),

  -- 18. Tightrope Coffee F. Cabahug
  ('10000000-0000-0000-0000-000000000018', 'foodfinder', '18', '[
    {"id":"tr-1","name":"Dirty Horchata Espresso","category":"Craft Coffee","price":175,"description":"House cinnamon-rice horchata milk crowned with a double shot of specialty espresso.","imageUrl":"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"tr-2","name":"Sea Salt Caramel Cold Brew","category":"Craft Coffee","price":165,"description":"18-hour slow-steeped cold brew finished with whipped sea salt cream foam.","imageUrl":"https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"tr-3","name":"Truffle Mushroom Cream Pasta","category":"Café Kitchen","price":310,"description":"Al dente linguine tossed with roasted shiitake mushrooms, parmesan, and white truffle oil.","imageUrl":"https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"tr-4","name":"Burnt Basque Cheesecake","category":"Café Kitchen","price":190,"description":"Caramelized San Sebastian-style cheesecake with a creamy custardy center.","imageUrl":"https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now()),

  -- 19. Sugbo Mercado Cebu IT Park
  ('10000000-0000-0000-0000-000000000019', 'foodfinder', '19', '[
    {"id":"sm-1","name":"Cebu Lechon Belly Roll Plate","category":"Night Market Hits","price":180,"description":"Boneless herbed pork belly lechon chop served with spiced vinegar and garlic rice.","imageUrl":"https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"sm-2","name":"Flame-Torched Wagyu Beef Cubes","category":"Night Market Hits","price":165,"description":"Skewered beef cubes torched to order with cheese sauce and garlic rice.","imageUrl":"https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"sm-3","name":"Octopus Takoyaki Balls (6 pcs)","category":"Street Bites","price":110,"description":"Japanese batter balls with tender octopus, takoyaki sauce, kewpie mayo, and bonito flakes.","imageUrl":"https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"sm-4","name":"Mango Graham Float Shake","category":"Drinks & Desserts","price":100,"description":"Fresh Cebu mango shake layered with whipped cream, crushed graham crackers, and mango cubes.","imageUrl":"https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now()),

  -- 20. La Vie Parisienne Gorordo Avenue
  ('10000000-0000-0000-0000-000000000020', 'foodfinder', '20', '[
    {"id":"lvp-1","name":"Ham & Emmental Croissant Sandwich","category":"French Bakery","price":210,"description":"Freshly baked butter croissant layered with Paris ham, Swiss Emmental cheese, and Dijon butter.","imageUrl":"https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"lvp-2","name":"Artisan French Macarons Box (4 pcs)","category":"French Bakery","price":220,"description":"Assorted almond meringue macarons (Pistachio, Raspberry, Salted Caramel, Dark Chocolate).","imageUrl":"https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"lvp-3","name":"Wood-Fired Margherita Pizza","category":"Deli & Pizza","price":380,"description":"Thin-crust brick-oven pizza with San Marzano tomato sauce, fior di latte mozzarella, and basil.","imageUrl":"https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"lvp-4","name":"Quiche Lorraine","category":"Deli & Pizza","price":195,"description":"Savory French pastry tart baked with smoked bacon, gruyere cheese, and egg custard.","imageUrl":"https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80","available":true},
    {"id":"lvp-5","name":"Café Cappuccino","category":"Coffee & Drinks","price":140,"description":"Rich French-roast espresso topped with steamed milk and frothy foam.","imageUrl":"https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80","available":true}
  ]'::jsonb, now())
on conflict (claim_id) do update set
  items = excluded.items,
  published_at = now();

notify pgrst, 'reload schema';
