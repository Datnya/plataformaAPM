import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://ovflbrrnqgmooutlukyf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92ZmxicnJucWdtb291dGx1a3lmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEzOTU3NSwiZXhwIjoyMDgzNzE1NTc1fQ.UQ06rWqNXBUt6ZcraTfuU7PblS6dzCqAzmslKsWSSNU');

const run = async () => {
    console.log("Fetching by string '1'...");
    const { data: c1, error: e1 } = await supabase.from('certificates').select('*').eq('project_id', '1');
    console.log("Result (string):", c1?.length, e1);

    console.log("Fetching by number 1...");
    const { data: c2, error: e2 } = await supabase.from('certificates').select('*').eq('project_id', 1);
    console.log("Result (number):", c2?.length, e2);

    process.exit(0);
};

run().catch(console.error);
