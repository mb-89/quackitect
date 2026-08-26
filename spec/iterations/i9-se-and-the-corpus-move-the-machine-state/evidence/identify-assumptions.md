---
form: identify-assumptions
by: agent
signed_off: 2026-08-19T13:37:34.404Z
authors: agent
files: null
---

# Evidence form / identify-assumptions

## current_situation

The sweep's input is the register this iteration wrote: four new rows and one re-earned.

THREE OF THE SIX SOURCES PRODUCED SOMETHING, and the three that did not are answered with the standing node or the standing row that already owns the question.

THE HEAVIEST ONE IS THE HOST. The iteration's largest goal rests on the editor running our code when a folder is opened, and that has been read about rather than run.

## assumptions

- project/spec/trace/raid/raid-asm-the-editor-fires-something-when-a-folder-is-opened.md
- project/spec/trace/raid/raid-asm-a-per-person-place-outside-every-project-exists-on-each-platform.md
- project/spec/trace/raid/raid-asm-first-time-readers-can-be-found-and-are-the-people-the-row-means.md
- project/spec/trace/raid/raid-asm-the-branch-independence-ruling-constrains-branch-and-not-depth.md

## sweep

- environment: NONE NEW, and the reason is that this delta moves files rather than changing volumes. Nothing here assumes anything about scale, load or the shape of the data. The one thing about the world around the system that these rows do lean on is who else can reach the machine, and that is carried by the platform entry below rather than duplicated here. What might look like an environment assumption — that a folder somebody opened is a folder they meant to drive — is not one: it has already happened, so it is recorded as an issue rather than as something merely believed.
- toolchain: NONE NEW, and two standing rows already own the question. req-setup-floor-editor-shell demands the setup check a floor of editor and shell before touching anything, and req-one-script-installs now names installing the runtime as its first act. The thing worth stating explicitly is that a launcher can install a runtime without having one, which holds because the launcher is a shell script and the shell is exactly the floor that standing row checks. That is a fact with a citation rather than an assumption.
- host: ONE NEW, and it is the most load-bearing thing in the iteration — raid-asm-the-editor-fires-something-when-a-folder-is-opened. The entry-point goal rests entirely on the editor running our code when a folder is opened: on its own, every time, and early enough that nobody is left waiting. The prior-art reading at the M2 gate found the editor documents at least four ways a folder-open can start or surface something, so the mechanism plainly exists. Reading that is not the same as having run ours through one, and one of the four is documented as never firing in an untrusted workspace whatever the setting says — which makes this assumption and the consent issue interact rather than sit side by side. Graded crippling, because the fallback is a resident service watching folders, which is a different product.
- platform: ONE NEW — raid-asm-a-per-person-place-outside-every-project-exists-on-each-platform. The consent row demands a record kept outside the folder it is about, and no platform has been checked for a place that exists, is writable without ceremony, survives between sessions, and cannot be reached from a checkout. Two compared systems do exactly this, which is evidence the shape works rather than evidence it works here. THE EPHEMERAL HOST IS THE SHARP CORNER: a machine created for one run and destroyed has no place that survives, by construction, and the design has to say what happens there rather than assume it away.
- neighbours: NONE NEW, and one standing entry already carries the only seam this delta touches — raid-asm-a-machinery-note-still-has-a-home-when-the-open-folder-is-not-ours, about what happens when the folder standing open belongs to somebody else's product. Nothing else here crosses to a neighbouring system. The collapse changes no format and no protocol, so no datasheet is being trusted in place of a run.
- people: ONE NEW — raid-asm-first-time-readers-can-be-found-and-are-the-people-the-row-means. One row's pass line can only be read off a person, and no person has ever been watched: the ramp-up report's population claims have stood at zero observations since i1. The assumption has two halves that fail differently. They must be FINDABLE in enough number, and each one is consumed by being measured, because a person who has seen the folder is no longer a first-time reader. And they must be the RIGHT people, rather than whoever was nearby and therefore more patient than the newcomer the row is about.

## follow_up

THE NEXT STATE PROBES ALL STANDING ASSUMPTIONS, not only these four, and two of the four have probes that are one call each.

- Whether the editor starts our code on folder-open is answered by instrumenting the extension and opening a folder four times: cold, with a window already open, after a restart, and on a folder carrying no trust decision.
- Whether a per-person place exists outside every project is answered by writing one byte, deleting the project it came from, and reading it back.

ONE PROBE IS NOT TECHNICAL AND SHOULD BE ASKED RATHER THAN ENGINEERED. Finding three people who have never seen this product is the whole probe for the discoverability assumption, and it either produces names or produces the honest answer that the row cannot be verified yet.

ONE MEASUREMENT RIDES ALONG FOR FREE. The editor probe opens a folder and watches when our code wakes, which is the same observation the owner's report about a control taking over a second needs. Running one instrument for both is cheaper than building two.

THE OLDEST ASSUMPTION IS STILL THE ONE THAT MATTERS MOST. The branch-independence reading is graded crippling and has been open since this iteration's first milestone. Its probe is a test the iteration already promised as a goal, so it is owed twice over.

## anything_else

