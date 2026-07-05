# guidance: how the walk works (internals)

<!-- ai:3 -->
This chapter holds internals about how the agent drives the loop. Readers of the system chapters never need it.

<!-- ai:3 -->
The agent asks the engine for the next ready check, fills it, and stops at every gate. Killer checks and milestone gates always reach the user as a handover pager. The agent may approve only non-killer reviews, and every approval is stamped with who decided it.

<!-- ai:3 -->
Ideas and problems found mid-walk go to the note lane instead of derailing the current check. The retro at the next planning start turns them into durable improvements.
