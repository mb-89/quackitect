---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests that cover the change, or the check where it touches no code
      - name: check
        form: command
        expects: 0
        says: the check is green on the commit
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-pages-deploy-stands-green
step: do
record:
  - step: do
    hand: box 1c02af353dfc · claude-code-remote
    hash_before: 66023dfb48649abd44d22f888d69922fa86f9dc6
    hash_after: 08c918547250f9681663b9ee198725cb90c53898
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "   72.5  in all"
    inputs:
      - name: ask
        hash: 67ccc557fe9b97d3
        size: 517
    def: df12650931d480c9
reason: done
---

# Ask

The pages build and deployment run on main goes green, so a red run there names a real fault again.

Every push to main leaves a red pages run, since the build source names `/docs` on main and the tree carries no docs folder, so the run dies with No such file or directory @ dir_chdir0 - /github/workspace/docs.

- `docs/index.md` stands, a Jekyll page with front matter and no Liquid
- the pages build and deployment run on the merge commit of this group's pull request concludes success
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh check > /dev/null 2>&1 && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The pages run reads its source from the docs folder on main, and the tree holds none, so every run ends on the missing folder. A one-page docs/index.md now gives the build its source. The page points readers at the repository through the metadata the build fills, so it copies nothing from the README.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and the discussion names the one Liquid variable it adds
- the cleanup the change reveals is none: the folder holds one page
- the address stands in the build metadata alone, and the page points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The pages runs on main passed while `docs/book.html` stood, and every run since the folder left fails. The build log names its source as `./docs`, so the setting points at a folder the tree dropped.

| option | weighed |
|---|---|
| `docs/index.md` in the tree | taken: the run greens from the repository, and one delete undoes it |
| unpublish in the Pages settings | left: it wants a person, and the owner may still want the address |

The page departs from the ask in one place. It reads `site.github.repository_url`, a Liquid variable the build's metadata plugin fills, so the tracked file carries no address and no copy of the README.

The box ran `github-pages build` at version 232 over the tree on main, and it ends on the error the run log names. Over a copy of the new folder it builds `index.html` with the repository link. The copy sets `url` and `baseurl`, since the box's proxy refuses the Pages API lookup the runner makes with its token.
