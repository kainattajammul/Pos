-- Module 5: Branch Finance RLS (Supabase direct reads)
-- Backend Prisma uses privileged connection; enforce scope in application layer.

ALTER TABLE branch_finance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_expenses ENABLE ROW LEVEL SECURITY;

-- Deny direct browser writes; reads scoped via shop membership when using anon/authenticated roles.
