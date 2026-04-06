
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovflbrrnqgmooutlukyf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92ZmxicnJucWdtb291dGx1a3lmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEzOTU3NSwiZXhwIjoyMDgzNzE1NTc1fQ.UQ06rWqNXBUt6ZcraTfuU7PblS6dzCqAzmslKsWSSNU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test1() {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id, name, client_id, consultant_id, start_date, end_date, created_at,
      clients ( id, company_name ),
      consultant:users!projects_consultant_id_fkey ( id, name, email ),
      project_client_users ( user_id, users ( id, name, email ) )
    `)
    .order('created_at', { ascending: false });
  console.log('Projects list test:');
  console.log('Error:', error);
  console.log('Data len:', data?.length);
}

async function test2() {
  const { data, error } = await supabase
    .from("projects")
    .select(`
      id, name, client_id, consultant_id, start_date, end_date, created_at,
      consultant:users!projects_consultant_id_fkey ( id, name, email ),
      project_client_users ( user_id, users ( id, name, email ) ),
      goals ( id, description, type, status, due_date, created_at ),
      time_logs ( id, date, check_in_time, check_out_time, modality, areas_visited, people_met, evidence_urls, created_at )
    `)
    .limit(1);
  console.log('Projects detail test:');
  console.log('Error:', error);
  console.log('Data len:', data?.length);
}

(async () => {
    await test1();
    await test2();
})();
