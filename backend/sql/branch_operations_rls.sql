-- RLS for branch operations tables (direct Supabase client access)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_repair_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY customers_select ON customers
  FOR SELECT TO authenticated
  USING (
    shop_id IN (
      SELECT sm.shop_id FROM shop_members sm
      JOIN users u ON u.id = sm.user_id
      WHERE u.supabase_auth_id = auth.uid() AND sm.status = 'ACTIVE'
    )
  );

CREATE POLICY customers_no_write ON customers
  FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY branch_sales_select ON branch_sales
  FOR SELECT TO authenticated
  USING (
    shop_id IN (
      SELECT sm.shop_id FROM shop_members sm
      JOIN users u ON u.id = sm.user_id
      WHERE u.supabase_auth_id = auth.uid() AND sm.status = 'ACTIVE'
    )
  );

CREATE POLICY branch_sales_no_write ON branch_sales
  FOR ALL TO authenticated USING (false) WITH CHECK (false);
