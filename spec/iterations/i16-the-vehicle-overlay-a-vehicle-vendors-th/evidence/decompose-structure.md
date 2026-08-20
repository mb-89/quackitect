---
form: decompose-structure
reopened: 2026-08-18T15:40:28.059Z — record-adrs was re-signed after the fitness flags landed, so this claim answered ground that has since moved
by: agent
signed_off: 2026-08-18T15:40:31.272Z
authors: agent
files: null
---

# Evidence form / decompose-structure

## current_situation

The winner is cand-the-program-route, and this state is where its picks stop being picks and become a structure.

WHAT STOOD BEFORE THIS VISIT. Twenty elements from i1, i27 and i35, forty owed interface cells all answered, and two functions with no element at all.

THE TWO GAPS WERE BOTH THIS ITERATION'S OWN. `take-an-update` and `report-what-the-vehicle-changed` were minted at derive-functions on 2026-08-18 and had nowhere to live. They are the central mechanism of the winning design, so a decomposition without them would have been a decomposition of everything except the point.

WHY THEY WERE MISSING AT ALL. The corpus named the act and then hid it. The old `flow-copy` node carried a sentence saying a copy taking an update pulls its method sources from where it came from, which names an act and hands its mechanism to a boundary crossing so nothing has to model it. All 33 functions and all 59 flows were checked and none carried it.

WHAT THIS VISIT ADDED. Two elements, one interface, and nothing else. The matrix demanded exactly one new cell, because every other flow either crosses the system edge or was already allocated.

AND ONE INTERFACE STANDS THAT NO CROSSING DEMANDS. if-core-satellite, minted at i27. It is answered below rather than deleted.

## elements

- el-account
- el-arrival
- el-bootstrap
- el-change-reporter
- el-core
- el-coupling-disposer
- el-engine-delta
- el-entrypoint
- el-front-desk
- el-holding-pen
- el-method-compiler
- el-mirror
- el-project-producer
- el-query-evaluator
- el-record-store
- el-resolution-seam
- el-satellite
- el-satellite-supervisor
- el-test-runner
- el-update-runner
- el-vehicle-producer
- el-walk-engine

## allocation

TWENTY-TWO ELEMENTS, THIRTY-FIVE FUNCTIONS, FORTY-ONE INTERFACES. Every function is implemented at least once and every element implements at least one function.

### The spreads, and why each one is information rather than sloppiness

FIVE FUNCTIONS ARE IMPLEMENTED BY MORE THAN ONE ELEMENT. Each spread marks a real seam in the standing system.

- `stand-up-a-product` sits on el-bootstrap and el-entrypoint. One brings a machine to a product; the other is the door that starts it. The install and the entry are different artifacts that fail differently.
- `hold-the-method` sits on el-engine-delta and el-method-compiler. The compiler turns authored method into the machine. The delta reports where an overlay no longer resolves. Clause one of req-overlay-drift-reported lives on the second, not the first.
- `run-a-governed-walk`, the root function, sits on el-core and el-walk-engine. That is i27's core-and-satellite split showing through: the core routes and the engine walks.
- `serve-a-step` sits on el-satellite and el-walk-engine, for the same reason and in the same direction.
- `hold-the-work` sits on el-record-store and el-satellite-supervisor. The store holds a record; the supervisor decides which satellite owns it.

### The four functions of this iteration are each on exactly one element

THAT IS DELIBERATE AND IT IS WORTH SAYING. A producing or updating act spread over two elements would put the refuse-rather-than-half-do rule in two places, and cluster-the-bootstrap's whole coupling argument is that this rule is solved well once and badly twice.

- `bring-forth-a-vehicle` on el-vehicle-producer.
- `bring-forth-a-project` on el-project-producer.
- `take-an-update` on el-update-runner.
- `report-what-the-vehicle-changed` on el-change-reporter.

### The one new owed cell

el-change-reporter TO el-update-runner, carrying flow-vehicle-inventory, answered by if-change-reporter-to-update-runner.

IT IS THE FIRST FLOW EVER TO RUN INSIDE cluster-the-bootstrap. The cluster shared no flow at all until 2026-08-18, and its node was rewritten in the same visit to say so.

WHY THE TWO ARE NOT ONE ELEMENT. The inventory is an ANSWER IN ITS OWN RIGHT — a vehicle's owner can ask what they made their own without taking any update. Folding the reporter into the runner would make that question unaskable except as a side effect of an update.

### Two elements sit at no interface at all, and that absence is the guarantee

el-vehicle-producer AND el-arrival BOTH HAVE NO CELL. For el-vehicle-producer that is the fatal rule showing itself in the structure: flow-vehicle crosses OUT to nbr-descendant and any consumer inside this system would be a data path from the engine into its own descendant, which req-nothing-a-copy-does-reaches-its-source grades fatal.

el-update-runner SHOWS THE LEGAL DIRECTION BY CONTRAST. It has an inbound crossing from upstream and an outbound one to a person, and neither reaches an engine. An update arriving is not the same shape as a vehicle being read.

### Requirement coverage

EVERY REQUIREMENT REACHES THE STRUCTURE, most of them transitively through the functions their elements implement.

TWO ARE NAMED DIRECTLY, because the function chain cannot carry them. req-where-each-artifact-lands-when-driving sits on if-project-producer-to-resolution-seam, because it is a property of a record's format rather than of an act. req-overlay-drift-reported sits on if-change-reporter-to-update-runner for clause three, which is a property of what one element hands another.

## follow_up

IMMEDIATELY: evaluate-architecture, then gate-architecture.

WHAT evaluate-architecture INHERITS, and one part of it is weaker than the rest.

- TWENTY-TWO ELEMENTS with black-box descriptions, two of them written today.
- FORTY-ONE INTERFACES, forty of them older than this iteration.
- ONE NAMED TRIPWIRE that would falsify the whole route: raid-tripwire-i16-a-structural-migration-cannot-be-written. If an engine change cannot be expressed as a program, el-update-runner has nothing to run.
- AND THE STRUCTURE'S SHARPEST WEAKNESS, which is not a gap but a chosen cost. el-update-runner leaves its result in front of a person, and a person who does not read it has no signal. That is weaker than a merge conflict, honestly weaker, and it loses against the criterion this iteration ranked first.

TWO THINGS ARE UNMEASURED AND BOTH BELONG TO M6.

- Which commit counts as the version a vehicle was built from, once it has taken several updates. The first update is the clone point. Nothing yet records the ones after.
- The cold-start cost of resolving an identity on a machine that has never seen the named copy, recorded on if-project-producer-to-resolution-seam.

AND THE UPDATE PROGRAM'S FORMAT IS THE EXPENSIVE HALF, undesigned here on purpose. What a program may say decides whether an engine change can be expressed at all, which is exactly what the tripwire probes.

## anything_else

### The interface no crossing demands, answered rather than deleted

if-core-satellite CAME BACK AS `undemanded` AND IT STANDS. i27 minted it for the core-and-satellite architecture, which is the standing system this iteration is brownfield on top of.

WHY THE MATRIX CANNOT SEE IT. The matrix derives owed cells from FLOW EDGES between functions. if-core-satellite is a PROCESS BOUNDARY: it carries ten flows as transport, and each of those flows is already attributed to the element pair whose functions actually produce and consume it. A transport is invisible to a flow-derived demand by construction.

SO THE ANSWER IS THAT THE CHECK IS RIGHT AND THE INTERFACE IS ALSO RIGHT. The check asks whether every interface earns its place through a crossing, and this one earns its place through a different mechanism the check does not model.

WHAT I DID NOT DO. I did not touch it. It is i27's, this iteration created nothing that bears on it, and repairing another iteration's flow allocation is not this state's work.

ONE THING ABOUT IT IS GENUINELY LOOSE. flow-instruction appears in its `carries` list and in no cell anywhere in the matrix. That is a flow with no allocated producer or consumer, and it is worth a look from whoever owns el-core.

### The count in my own plan was wrong, and this is the correction

I CARRIED "FOUR UNIMPLEMENTED FUNCTIONS" INTO THIS STATE. The matrix says two.

el-vehicle-producer AND el-project-producer WERE ALREADY WRITTEN, earlier the same day, and I had counted them as outstanding. The real gap was `take-an-update` and `report-what-the-vehicle-changed` only.

### A question about el-arrival I raised and did not act on

el-arrival CARRIES `group: the-bootstrap` while all seven functions it implements sit in cluster the-arrival. That reads at first like staleness: i35 named the-arrival cluster and never wrote its node, which partition-functions had to fix today.

I CHECKED IT AND LEFT IT. Two reasons, and the second is the binding one.

- IT FITS. the-bootstrap's name was widened today to "acting on a whole tree from outside it, where half-done looks finished". An arrival takes a clone with no lane and produces one, and a half-done arrival looks finished. That is the cluster's hazard exactly.
- AND AN ELEMENT'S GROUP IS NOT REQUIRED TO EQUAL ITS FUNCTIONS' CLUSTER. Functions cluster by data and hazard; elements group by structure. This state's own guidance says brownfield joins as it is.

SO IT IS DEFENSIBLE AND I CANNOT PROVE IT WRONG. Recorded here rather than changed, because changing a standing element on a suspicion is how a decomposition starts editing things nobody asked about.
