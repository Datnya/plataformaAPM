import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://ovflbrrnqgmooutlukyf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92ZmxicnJucWdtb291dGx1a3lmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEzOTU3NSwiZXhwIjoyMDgzNzE1NTc1fQ.UQ06rWqNXBUt6ZcraTfuU7PblS6dzCqAzmslKsWSSNU');

const run = async () => {
    const { data: s, error: se } = await supabase.from('consultant_signatures').select('*');
    if (se) console.error("sig Error:", se);
    else console.log("Signatures count:", s.length);
    console.log("Names:", s.map(x => x.name));

    const { data: c, error: ce } = await supabase.from('certificates').select('*');
    if (ce) console.error("cert Error:", ce);
    else console.log("Certificates count:", c.length);

    process.exit(0);
};

run().catch(console.error);
