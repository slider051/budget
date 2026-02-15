drop function if exists public.get_annual_analysis_payload(integer);

drop index if exists public.idx_transactions_user_date;
drop index if exists public.idx_transactions_user_type_date;
drop index if exists public.idx_monthly_budgets_user_month;
