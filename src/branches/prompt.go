// The prompt a box starts with, off the group ticket and its route, so no
// spawn types the rules again.
// [[spec/tickets/a-verb-writes-box-prompts]]
package branches

// The rules every box prompt carries, in the order a box meets them. [[spec/guidance/cloud/cloud]]
const boxRules = `Rules for this box (the owner is away; decide every step yourself, never ask anybody anything, never end a turn on a question or a confirm):
- Take the branch with ./RUNME.sh branch take <group>, and read the ask it prints.
- Work the group to done with ./RUNME.sh ticket pull. Pass person steps yourself where the ticket's ask already answers them.
- After every clear or handover, run ./RUNME.sh ticket pull and continue; never stop at a handover.
- No timers and no sleeps in code or tests: wait on events; time only through the clock door.
- Each door is tested once against the real thing; every other test uses the door's fake; modules stay pure over the index.
- Commit with ./RUNME.sh commit, push yourself, keep ./RUNME.sh check green, merge main in (never rebase, never force-push, never --no-verify).
- When the group is done: ./RUNME.sh branch done, open the PR against main and turn on auto-merge with method MERGE. Watch its CI and fix any red until it merges.
- Other boxes work other groups in parallel; on a merge conflict, merge main and resolve.`
