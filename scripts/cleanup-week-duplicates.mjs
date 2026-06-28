import { assertConfirmation } from './safe-env.mjs';
import { chooseKeepWeek, initClient, loadDuplicateReport, printReport, TARGET_WEEK } from './audit-week-duplicates-core.mjs';

const CONFIRMATION = 'REMOVER-DUPLICATAS-22-28-06-2026';
const { args, supabase } = initClient();
const shouldApply = assertConfirmation(args, CONFIRMATION);
const groups = await loadDuplicateReport(supabase);
printReport(groups);
const duplicateGroups = groups.filter((group) => group.duplicate);
const decisions = duplicateGroups.map((group) => ({ group, decision: chooseKeepWeek(group) }));
const conflicts = decisions.filter(({ decision }) => decision.abort);
if (conflicts.length) {
  console.log('\nLimpeza bloqueada. Existem conflitos com progresso real em mais de uma semana.');
  process.exit(1);
}
const removeIds = decisions.flatMap(({ decision }) => decision.remove?.map((week) => week.id) || []);
if (!removeIds.length) {
  console.log('\nNada para remover.');
  process.exit(0);
}
if (!shouldApply) {
  console.log('\nDRY-RUN. Nenhuma semana foi removida.');
  console.log('Para aplicar: npm run cleanup:duplicates:2026-06-22 -- --apply --confirm=' + CONFIRMATION);
  process.exit(0);
}
const { error } = await supabase.from('weeks').delete().in('id', removeIds);
if (error) throw error;
console.log('\nLimpeza concluida para ' + TARGET_WEEK.label + ': ' + removeIds.length + ' semanas duplicadas removidas.');
