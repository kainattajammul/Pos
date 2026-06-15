-- Module 8: Branch Reporting RLS (apply in Supabase SQL editor when using direct client access)

ALTER TABLE branch_reporting_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_report_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_report_snapshots ENABLE ROW LEVEL SECURITY;

-- Deny direct browser writes; server uses Prisma service role
CREATE POLICY branch_reporting_settings_select ON branch_reporting_settings
  FOR SELECT USING (false);

CREATE POLICY branch_reporting_settings_modify ON branch_reporting_settings
  FOR ALL USING (false);

CREATE POLICY branch_report_exports_select ON branch_report_exports
  FOR SELECT USING (false);

CREATE POLICY branch_report_exports_modify ON branch_report_exports
  FOR ALL USING (false);

CREATE POLICY branch_report_snapshots_select ON branch_report_snapshots
  FOR SELECT USING (false);

CREATE POLICY branch_report_snapshots_modify ON branch_report_snapshots
  FOR ALL USING (false);
