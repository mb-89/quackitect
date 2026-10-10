---
kind: [[ticket]]
state: open
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

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The pages runs on main passed while `docs/book.html` stood, and every run since the folder left fails. The build log names its source as `./docs`, so the setting points at a folder the tree dropped.

| option | weighed |
|---|---|
| `docs/index.md` in the tree | taken: the run greens from the repository, and one delete undoes it |
| unpublish in the Pages settings | left: it wants a person, and the owner may still want the address |

The page departs from the ask in one place. It reads `site.github.repository_url`, a Liquid variable the build's metadata plugin fills, so the tracked file carries no address and no copy of the README.

The box ran `github-pages build` at version 232 over the tree on main, and it ends on the error the run log names. Over a copy of the new folder it builds `index.html` with the repository link. The copy sets `url` and `baseurl`, since the box's proxy refuses the Pages API lookup the runner makes with its token.
