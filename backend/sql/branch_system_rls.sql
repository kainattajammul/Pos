-- Module 10: Branch System & Audit RLS (apply in Supabase SQL editor when using direct client access)

ALTER TABLE branch_sync_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_sync_job_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_setting_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_ownerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY branch_sync_connections_deny ON branch_sync_connections FOR ALL USING (false);
CREATE POLICY branch_sync_jobs_deny ON branch_sync_jobs FOR ALL USING (false);
CREATE POLICY branch_sync_job_items_deny ON branch_sync_job_items FOR ALL USING (false);
CREATE POLICY branch_settings_deny ON branch_settings FOR ALL USING (false);
CREATE POLICY branch_setting_history_deny ON branch_setting_history FOR ALL USING (false);
CREATE POLICY branch_security_events_deny ON branch_security_events FOR ALL USING (false);
CREATE POLICY business_entities_deny ON business_entities FOR ALL USING (false);
CREATE POLICY branch_ownerships_deny ON branch_ownerships FOR ALL USING (false);

-- Audit logs remain read-only for browser clients
CREATE POLICY audit_logs_deny_write ON audit_logs FOR INSERT WITH CHECK (false);
CREATE POLICY audit_logs_deny_update ON audit_logs FOR UPDATE USING (false);
CREATE POLICY audit_logs_deny_delete ON audit_logs FOR DELETE USING (false);
