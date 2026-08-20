---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-score-the-work-at-dispatch-instead-of-declaring-it
type: "[[option]]"
cluster: the-sizing
question: how the driver for a piece of work is decided
statement: the strength a piece of work needs is estimated when the work arrives rather than written into the artifact beforehand, and the estimator is corrected by what happened afterwards
found_by: prior-art
source: Cursor's router, described at cursor.com/blog/how-cursor-router-works — a trained complexity predictor emitting a continuous score per request, retrained on live traffic labelled by whether the user proceeded or corrected; and AWS Bedrock Intelligent Prompt Routing, docs.aws.amazon.com/bedrock/latest/userguide/prompt-routing.html, which predicts per-request response quality against a tunable threshold
---

## Mechanism

NOTHING IS WRITTEN DOWN AHEAD OF TIME. A component sits at the point of
dispatch, looks at the item in front of it, and produces a number. The number
is compared against a threshold and a worker is chosen.

WHAT MAKES IT DIFFERENT IN KIND rather than in degree: the estimator has an
ERROR SIGNAL. Something downstream says whether the choice was right — a user
correcting the output, a quality score against a reference — and the estimator
moves. Nothing in a declared scheme can do that, because a declaration has
nothing to be wrong against.

WHAT IT COSTS: the same work does not get the same worker twice, so a finished
run cannot be replayed. Both cited systems accept that, and one of them hides
the chosen worker from the user by default.

WHY IT BELONGS IN THE SET even though the owner has ruled for a declared
scheme: it is the only option here that can ever learn, and the ruling should
be made against it rather than around it.
