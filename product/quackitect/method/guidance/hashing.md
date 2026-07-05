# guidance: hashing and the suspect mechanism (internals)

<!-- ai:3 -->
This chapter holds internals. The average reader never needs it; the guidance tag brings the interested one here.

<!-- ai:3 -->
Every check carries a fingerprint over its statement, its inputs, and the content it depends on. A bless records the fingerprint at approval time. When any input changes, the fingerprint no longer matches - the check turns SUSPECT and asks for a fresh look. Milestone gates additionally fold their evidence document's content, so approved evidence cannot change silently.

<!-- ai:3 -->
The whole spec folds into one merkle root. The book stamps that root, which is what makes every rendered claim traceable to the exact approved state.
