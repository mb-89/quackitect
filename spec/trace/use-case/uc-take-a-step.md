---
minted_in: i1
id: uc-take-a-step
type: "[[use-case]]"
statement: Do one step of the walk and record what it produced.
actor: stk-engineer-driving-agents
trigger: the walk stands on a state whose work is not done
precondition: everything the state demands be read has been read
guarantee: the state's evidence form is filled and checked, and the walk may move on
refines:
  - sty-walk-it-by-hand
  - sty-the-agent-proves-it-read
  - sty-carry-a-finding-without-stopping
priority: must
---

## Main scenario

1. Whoever is driving asks the machine what to do.
2. The machine answers with the state's guidance, the tools legal here, and the form it owes.
3. The work is done using only those tools.
4. The form is filled, field by field.
5. The submit checks the fields' shapes and stamps the claim.
6. The walk may move to the next state.

## Lane doors

Step 1 is `se_pull`. It is the only verb that moves the walk. `se_aim` points
it at a state first, and aiming alone changes nothing.

Step 3 is done through the lane, never through the host's own tools:

- `se_file_read` reads a file, and hands back the hash to write against.
- `se_file_search` finds text; the intent stated is logged with the query.
- `se_file_glob` lists files by pattern.
- `se_file_list` shows what a folder holds.
- `se_file_write` creates a file, or overwrites one at the hash it was read at.
- `se_file_patch` makes many edits, over many files, in one atomic call.
- `se_file_replace` runs one regex over a glob, and reports every place it landed.
- `se_file_move` renames.
- `se_file_delete` removes.
- `se_run` runs a command, with its output captured whole under a ref.

Extension 6a is answered by `se_why`. It names every condition holding a
state grey, each with its own remedy, rather than only the first to fail.

Extension 6b is answered by `se_stop`. It names which sanctioned stop applies
and why, on the record, because the tooth that refused the turn reads the call
log rather than the message.

## Extensions

- 2a. Something is owed as reading. The machine hands over one document and asks for proof before the work opens.
- 3a. A tool outside the legal set is reached for. The refusal names the clause, what was expected, and the exact call to make instead.
- 4a. A field takes node references. A line naming nothing is refused, and the type's template is one click away.
- 4b. A field declares coverage over another type. Both directions are checked, and an orphan on either side keeps the state unmet.
- 4c. A check turns up a real defect that breaks nothing here. It is recorded as an OWED item naming an open register entry with an owner, the state signs, and the walk moves on. The close refuses while any owed item stands.
- 4d. An owed item names no open register entry. The submit refuses it, because a disposition nobody agreed to is not a disposition.
- 5a. A required field is empty. The submit names which, and nothing is stamped.
- 6a. The next state's entry conditions do not hold. The walk stops here and names what is missing.
- 6b. The turn has to end while the walk still has legal work. Ending is refused until one of the sanctioned stops is named on the record, and one naming releases one stop.

<!-- Added by i63. -->

- 3b. THE STEP TURNS UP A DEFECT THAT BLOCKS NOTHING. The finding becomes work in its own right and is placed on the state that will fix it, rather than on a list somebody has to route afterwards. The walk continues, and the finding is owed where it will be done. It is 4c seen from the other end: the owed item still names an open register entry, and what changes is that it also sits where the fix happens.
