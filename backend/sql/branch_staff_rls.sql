-- Supabase RLS policies for branch staff module (optional — apply when using direct client access)
-- Prisma server-side connections bypass RLS; application code must enforce shop/branch scope.

ALTER TABLE branch_staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_staff_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_staff_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_security_rules ENABLE ROW LEVEL SECURITY;

-- Example: users can read their own assignments
CREATE POLICY branch_staff_assignments_select_own ON branch_staff_assignments
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE supabase_auth_id = auth.uid()
    )
  );

-- Shop-scoped management should be enforced via service role + application layer.
-- Do not expose service-role keys to browsers.
