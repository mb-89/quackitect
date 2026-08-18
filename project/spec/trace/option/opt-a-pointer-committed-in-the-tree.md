---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-a-pointer-committed-in-the-tree
type: "[[option]]"
statement: the produced tree carries a committed file naming what it must follow back, written relative to that file's own directory rather than to the caller's
cluster: the-walk
question: how a tree carrying no method finds the copy that drives it
found_by: prior-art
source: "git's gitfile (git-scm.com/docs/gitrepository-layout) and its source dir.c and worktree.c; Yarn yarnPath (yarnpkg.com/configuration/yarnrc); pkg-config ${pcfiledir} (manpages.debian.org pkg-config.1)"
---

## Mechanism

THE TREE CARRIES ITS OWN ANSWER. A small committed file names the home, and the
program reads it on arrival instead of searching or being told.

THE WHOLE QUESTION IS RELATIVE VERSUS ABSOLUTE, and git's own source settles
it rather than any argument. A submodule's `.git` file is written with a
relative path unconditionally. A worktree's is written absolute by default.

THAT IS WHY `git worktree repair` EXISTS. Git's documentation states the
failure plainly: move the main worktree and linked worktrees cannot find it,
and a repair command reestablishes the connection. Git later added a config
flag to write relative paths instead, and says it is for setups where trees may
be moved.

YARN GIVES THE RULE IN ITS CLEANEST FORM. Its pointer is resolved against the
DECLARING FILE'S own directory, never the current directory. Its own repository
ships one, and its recommended ignore file deliberately un-ignores the target
so the pointer and what it names travel together.

pkg-config DOES THE SAME WITHOUT A POINTER AT ALL. A data file declares its own
root relative to wherever that file was found, and the documentation names
relocatability as the purpose.

WHAT IT BUYS. The answer travels with the tree through a move, a copy to
another machine and a colleague's clone, provided the path is relative and the
target travels too. Nothing machine-local is involved, so this product's path
jail is never asked to widen.

WHAT IT COSTS, AND IT IS THE COST THIS ITERATION MUST WEIGH. A relative pointer
only survives while both trees keep their relative positions. A driven project
and the copy driving it are two independent repositories that a person will
move separately, so the relative form buys much less here than it does for a
git submodule sitting inside its parent.

SO THE HONEST READING IS THAT NEITHER FORM IS SAFE FOR THIS SHAPE. Absolute
breaks on a move. Relative breaks when the two trees stop being neighbours. The
mechanism is sound and its assumption does not hold for independent trees.

AND CMake IS THE WARNING. It stores an absolute path in its build tree, and its
documentation says outright that the result is specific to the machine and not
redistributable. It survives because it is disposable, which a driven project
is not.

THAT PUSHES TOWARD NAMING AN IDENTITY RATHER THAN A LOCATION, which is a
different option: [[opt-the-tree-names-what-not-where]].
