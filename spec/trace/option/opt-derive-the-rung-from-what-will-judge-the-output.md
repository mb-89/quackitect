---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-derive-the-rung-from-what-will-judge-the-output
type: "[[option]]"
cluster: the-sizing
question: how a step's difficulty is arrived at
statement: "no one types a difficulty: each step declares what will judge its output, and the difficulty is computed from that, so a machine-checkable judge caps the rung and only a step judged by a reader alone can reach the top"
found_by: prior-art
source: Kubernetes Quality of Service classes, kubernetes.io/docs/concepts/workloads/pods/pod-qos/ — there is no QoS field to set; the class is computed from requests and limits, so it is a consequence of measurable quantities rather than a label an author types
---

## Mechanism

INVERT WHO DECIDES. Instead of an author writing a rung and the engine reading
it, the author writes something CHECKABLE and the engine derives the rung.

WHAT A STEP WOULD DECLARE: the thing that judges its output. A schema, a test, a
compiler, a diff against a live source — or nothing but a reader. The mapping
from judge to rung is then fixed and small.

WHY IT IS THE STRONGEST ANSWER TO THE DRIFT PROBLEM. A typed rung can be wrong
forever and nothing contradicts it. A derived rung is wrong only if the declared
judge is wrong, and a declared judge is itself checkable — you can run it.

WHAT IT COSTS: every row must name its judge, which changes what a matrix row
DECLARES rather than adding to it. That is a larger edit than a number, and it
is why this is an option rather than the plan.

IT ALSO SUBSUMES PART OF THE PROBLEM. The seam this ladder draws between
applying a method and authoring content is almost exactly the seam between a
machine-checkable judge and a reader.
