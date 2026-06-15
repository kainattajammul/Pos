-- RLS policies for direct Supabase client access to branch inventory tables.
-- Server-side Prisma uses a privileged connection; enforce shop/branch scope in services regardless.

ALTER TABLE branch_inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_low_stock_alerts ENABLE ROW LEVEL SECURITY;

-- Read-only for authenticated shop members on assigned branches
CREATE POLICY branch_inventories_select ON branch_inventories
  FOR SELECT TO authenticated
  USING (
    shop_id IN (
      SELECT sm.shop_id FROM shop_members sm
      JOIN users u ON u.id = sm.user_id
      WHERE u.supabase_auth_id = auth.uid() AND sm.status = 'ACTIVE'
    )
  );

-- Block direct inserts/updates/deletes — stock changes must go through backend API
CREATE POLICY branch_inventories_no_write ON branch_inventories
  FOR ALL TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY branch_stock_movements_select ON branch_stock_movements
  FOR SELECT TO authenticated
  USING (
    shop_id IN (
      SELECT sm.shop_id FROM shop_members sm
      JOIN users u ON u.id = sm.user_id
      WHERE u.supabase_auth_id = auth.uid() AND sm.status = 'ACTIVE'
    )
  );

CREATE POLICY branch_stock_movements_no_write ON branch_stock_movements
  FOR ALL TO authenticated
  USING (false)
  WITH CHECK (false);
