---
condition: read
---

# read — proven reading of the listed documents

Arguments: the documents (root-relative paths) that must be READ before the
state can be left (exit) or entered (entry). Beyond the explicit lists, THE
PULL is an entry condition everywhere outside boot: entering a state
demands its pulled guidance proven read too.

The proof is per hand:

- **The agent sends hashes.** A doc's hash is a token you can only hold by
  reading through the lane — `se_file_read` returns it; packets never
  print it. Tick with `read_hashes: {"<path>": "<hash>", ...}`; every hash
  must match the doc AS IT STANDS, and it is demanded fresh on every tick.
  After a compaction the tokens are gone from your head — re-read, that is
  the point.
- **The human checks the box.** In the mirror, each doc carries a
  checkbox: one check per VERSION of the file. The check pins the doc's
  current hash; an edited doc unchecks itself and asks again.

THE HANDOVER RULE: the human's checked docs are the SESSION's reading
list (`human_checked` in every packet). When the agent takes over — the
slider rises mid-walk — its advances must prove that same list by hash,
even past transitions the human already walked: their checkmark is not
the agent's reading.

Sending a hash without reading defeats the machine's whole purpose — the
hash proves the doc passed through your hands, not your head. Reading is
what the machine is FOR.
