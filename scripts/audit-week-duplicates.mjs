import { initClient, loadDuplicateReport, printReport } from './audit-week-duplicates-core.mjs';

const { supabase } = initClient();
const groups = await loadDuplicateReport(supabase);
printReport(groups);
