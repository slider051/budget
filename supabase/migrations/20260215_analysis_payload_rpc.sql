-- Phase 3: Annual analysis aggregation via RPC (server-side)

create index if not exists idx_transactions_user_date
  on public.transactions (user_id, date);

create index if not exists idx_transactions_user_type_date
  on public.transactions (user_id, type, date);

create index if not exists idx_monthly_budgets_user_month
  on public.monthly_budgets (user_id, month);

create or replace function public.get_annual_analysis_payload(p_year integer)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_start_date date := make_date(p_year, 1, 1);
  v_end_date date := make_date(p_year, 12, 31);
  v_summary jsonb;
  v_monthly_summaries jsonb;
  v_expense_totals jsonb;
  v_income_totals jsonb;
begin
  if v_user is null then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  if p_year < 2000 or p_year > 2100 then
    raise exception 'Invalid year' using errcode = '22023';
  end if;

  with tx as (
    select
      t.type,
      t.amount::numeric as amount
    from public.transactions t
    where t.user_id = v_user
      and (t.date)::date between v_start_date and v_end_date
  ),
  totals as (
    select
      coalesce(sum(amount) filter (where type = 'income'), 0)::numeric as total_income,
      coalesce(sum(amount) filter (where type = 'expense'), 0)::numeric as total_expense
    from tx
  )
  select jsonb_build_object(
    'year', p_year,
    'totalIncome', total_income,
    'totalExpense', total_expense,
    'netSavings', total_income - total_expense
  )
  into v_summary
  from totals;

  with months as (
    select generate_series(1, 12) as month_num
  ),
  tx_monthly as (
    select
      extract(month from (t.date)::date)::int as month_num,
      coalesce(sum(t.amount::numeric) filter (where t.type = 'income'), 0)::numeric as income,
      coalesce(sum(t.amount::numeric) filter (where t.type = 'expense'), 0)::numeric as expense
    from public.transactions t
    where t.user_id = v_user
      and (t.date)::date between v_start_date and v_end_date
    group by 1
  ),
  budget_monthly as (
    select
      split_part(mb.month, '-', 2)::int as month_num,
      coalesce(sum((c.value)::numeric), 0)::numeric as budget
    from public.monthly_budgets mb
    left join lateral jsonb_each_text((mb.categories)::jsonb) as c(key, value) on true
    where mb.user_id = v_user
      and mb.month like p_year::text || '-%'
    group by 1
  ),
  merged as (
    select
      m.month_num,
      coalesce(tx.income, 0)::numeric as income,
      coalesce(tx.expense, 0)::numeric as expense,
      (coalesce(tx.income, 0) - coalesce(tx.expense, 0))::numeric as net_savings,
      coalesce(b.budget, 0)::numeric as budget
    from months m
    left join tx_monthly tx on tx.month_num = m.month_num
    left join budget_monthly b on b.month_num = m.month_num
    order by m.month_num
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'month', to_char(make_date(p_year, merged.month_num, 1), 'YYYY-MM'),
        'monthLabel', merged.month_num::text || ' month',
        'income', merged.income,
        'expense', merged.expense,
        'netSavings', merged.net_savings,
        'budget', merged.budget
      )
      order by merged.month_num
    ),
    '[]'::jsonb
  )
  into v_monthly_summaries
  from merged;

  with grouped as (
    select
      t.category,
      sum(t.amount::numeric) as amount
    from public.transactions t
    where t.user_id = v_user
      and t.type = 'expense'
      and (t.date)::date between v_start_date and v_end_date
    group by t.category
  ),
  totals as (
    select coalesce(sum(g.amount), 0)::numeric as total_amount
    from grouped g
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'category', g.category,
        'amount', g.amount,
        'percentage',
          case when t.total_amount > 0 then (g.amount / t.total_amount) * 100 else 0 end
      )
      order by g.amount desc
    ),
    '[]'::jsonb
  )
  into v_expense_totals
  from grouped g
  cross join totals t;

  with grouped as (
    select
      t.category,
      sum(t.amount::numeric) as amount
    from public.transactions t
    where t.user_id = v_user
      and t.type = 'income'
      and (t.date)::date between v_start_date and v_end_date
    group by t.category
  ),
  totals as (
    select coalesce(sum(g.amount), 0)::numeric as total_amount
    from grouped g
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'category', g.category,
        'amount', g.amount,
        'percentage',
          case when t.total_amount > 0 then (g.amount / t.total_amount) * 100 else 0 end
      )
      order by g.amount desc
    ),
    '[]'::jsonb
  )
  into v_income_totals
  from grouped g
  cross join totals t;

  return jsonb_build_object(
    'year', p_year,
    'summary', coalesce(
      v_summary,
      jsonb_build_object(
        'year', p_year,
        'totalIncome', 0,
        'totalExpense', 0,
        'netSavings', 0
      )
    ),
    'monthlySummaries', coalesce(v_monthly_summaries, '[]'::jsonb),
    'expenseTotals', coalesce(v_expense_totals, '[]'::jsonb),
    'incomeTotals', coalesce(v_income_totals, '[]'::jsonb)
  );
end;
$$;

revoke all on function public.get_annual_analysis_payload(integer) from public;
grant execute on function public.get_annual_analysis_payload(integer) to authenticated;
grant execute on function public.get_annual_analysis_payload(integer) to service_role;

