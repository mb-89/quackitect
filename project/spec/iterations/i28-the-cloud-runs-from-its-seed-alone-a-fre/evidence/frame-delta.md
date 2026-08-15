---
form: frame-delta
by: agent
signed_off: 2026-08-15T15:04:24.678Z
authors: agent
files:
---

# Evidence form / frame-delta

## current_situation

The as-is is signed with witnesses on both halves, and the register stands at six entries. This state says what we are closing and why now.

THE BASELINE'S SHAPE, carried forward in one line: the disk and git both claim to be the truth about which iterations exist, and they disagree.

## gap_claim

THE GAP, AS A CLAIM SOMEBODY COULD DISAGREE WITH: a machine that has this repository and a seed id cannot start work, because the machinery answers "which iterations exist" from a folder that only the machine that seeded them has.

THAT IS FALSIFIABLE and it was falsified in the field on 2026-08-14 in our favour — the owner's second machine saw zero iterations.

### The alternatives, and what each sheds

The field scanned is on-demand ephemeral workspaces, which is a solved shape elsewhere.

- CODESPACES AND GITPOD create a workspace from a repository reference and destroy it after. THEY SHED the need for any local state to be authoritative, and they are better than us at this today because a workspace's absence is never read as the work not existing. WHAT THEY COST is a hosted control plane and a container per workspace.
- GIT WORKTREE ITSELF, which we already use, SHEDS the question entirely: its own list is the authority and its remove refuses a dirty tree. WHAT IT COSTS is nothing we are not already paying, and we lost its refusal by reimplementing the question with existsSync.
- DEVCONTAINERS SHED environment drift, which is the half of our bootstrap that is prose today. WHAT THEY COST is that they carry no walk to resume, so the record and position half stays ours regardless.
- DOING NOTHING SHEDS all build cost and keeps a folder browsable by any tool without the engine. WHAT IT COSTS is that no second machine can ever be given work, which is the thing this iteration exists for.

### What ours sheds, positioned against that field

NO CONTROL PLANE, NO CONTAINER PER WORKSPACE, NO DAEMON A PERSON KEEPS ALIVE. A seed is a git branch. A machine that adopts one needs git and node.

THAT IS THE POSITION, and it is genuinely lighter. It is also why the disk copy was tempting: with no control plane, the folder looked like the cheapest place to keep the answer.

## why_now

THREE THINGS MATURED, and none of them is a preference.

- THE SECOND MACHINE IS REAL. Two of them have now worked this product — a cloud container on 2026-08-13 and the owner's own second machine on 2026-08-14. Before that, disk and git agreeing was a coincidence nobody had to notice.
- THE WRITE SIDE ALREADY LANDED. Seeding pushes `it/<id>` to the shared remote, and the claim lane pushes its ledger. So the expensive half of "git is the truth" is built and paid for. What remains is a reader.
- i27 SHIPPED, AND IT CHANGED WHAT A FOLDER MEANS. Its own ruling is that this product's records walk on trunk and get no worktree. That makes a folder-per-iteration incoherent rather than merely wasteful, and i27's own leftover folder is what blocked this iteration's entry.

AND ONE THING THAT DID NOT MATURE — IT BROKE. Entering this iteration required repair, in this session, on a machine that was already configured. The owner's ruling followed: starting an iteration is entering it, not cleaning up.

## value_props

- none

## business_case

WHAT THE EFFORT BUYS, IN THE ONLY CURRENCY THIS PRODUCT HAS: machines that can be given work.

THERE IS NO ACQUIRER AND NO PRICE, so the money framing is skipped with that as the recorded reason. What replaces it is the owner's own argument for placing this iteration second in the run order, quoted from version-planning.md: "every one of them saves time inside one machine, and this one adds machines. It multiplies the whole set rather than any single record."

THE MEASURED SIDE, so it is not only an argument.

- vp-the-engine already carries the target: acts from clone to first claimed iteration, target two. Today the answer is unbounded, because a fresh clone sees no iterations at all and a person has to intervene.
- The entry that provoked this iteration cost about a dozen calls and five shell commands on an already-configured machine. That is the cost per start today, and it is paid by every machine every time.

WHAT IT COSTS TO BUY. One reader change, one entry path, one close path, one lane verb, and a bootstrap script. The expensive half is already built.

THE HONEST CAVEAT: none of this pays off until a second machine is actually used. If the answer is that only one machine will ever run this, the whole case collapses to tidiness. Two machines have already run it, which is why that is not the situation.

## follow_up

- scope-non-goals takes this delta and cuts what is in, and the five points of the owner's design are the spine of it
- pressure-test is where the gap claim gets attacked, and the doing-nothing alternative is the one to attack it with
- the routing pain found in this walk is not yet anywhere but the as-is, and it needs a home before M1 closes
- nothing is parked from this state

## anything_else

THE VALUE PROPS FIELD SAYS `none` DELIBERATELY. This delta authors no new value proposition. It serves [[vp-the-engine]], which already carries its acceptance target as a success criterion, and draft-vision recorded that inheritance rather than restating it here.

Writing a new prop to have something to point at would be the defect the prop's own success criteria exist to prevent.
