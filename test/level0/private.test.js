// The run and the token, over strings alone. A note is a dump and carries
// anything a person puts in it, and a tracked line carrying the note's own
// words lands on trunk, where it stays. These cases hold that boundary.
// [[spec/design_output/private#the-run-and-the-token]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  carriedFrom,
  COPY_RUN,
  isIdentifier,
  longestSharedRun,
  refusedPrivate,
  sharedIdentifiers,
  wordsOf,
} from "../../.claude/skills/level0/lib/private.js";

const PRIVATE =
  "the box at /home/somebody/secrets stalls when Fnordwick runs it twice";
const WORDY =
  "the box stalls badly whenever somebody starts it a second time in a row";

const noted = (text, name = "one.md") => [{ name, text }];

test("a run of six words is the line, and the constant says so", () => {
  assert.equal(COPY_RUN, 6);
});

test("the flatten lowers the case, drops the punctuation and folds the space", () => {
  assert.deepEqual(wordsOf("  The Box, STALLS.  twice!  "), [
    "the",
    "box",
    "stalls",
    "twice",
  ]);
});

// [[spec/design_output/private#what-a-secret-looks-like]]
test("a token carrying a separator inside it reads as an identifier", () => {
  assert.equal(isIdentifier("/home/somebody/secrets"), true);
  assert.equal(isIdentifier("maria@example.com"), true);
  assert.equal(isIdentifier("c:\\users\\somebody"), true);
  assert.equal(isIdentifier("example.com"), true);
  assert.equal(isIdentifier("reachability"), true);
  assert.equal(isIdentifier("stalls"), false);
});

test("a verbatim paste comes back as the run, in the writer's own spelling", () => {
  const said = longestSharedRun(`Noticed: ${WORDY}`, WORDY);
  assert.equal(wordsOf(said).length >= COPY_RUN, true);
  assert.match(said, /stalls badly whenever somebody starts it/);
});

test("punctuation swapped for spaces carries no paste through", () => {
  const said = longestSharedRun(WORDY.split(" ").join("-"), WORDY);
  assert.equal(wordsOf(said).length >= COPY_RUN, true);
});

test("a shared vocabulary is no run, so an honest rewrite passes", () => {
  const said = longestSharedRun("the box stalls when it runs twice", PRIVATE);
  assert.equal(wordsOf(said).length < COPY_RUN, true);
});

test("two texts sharing nothing answer the empty run", () => {
  assert.equal(longestSharedRun("a clean statement", "wholly other words"), "");
  assert.equal(longestSharedRun("", PRIVATE), "");
});

// [[spec/design_output/private#what-a-secret-looks-like]]
test("one shared path is enough, though no run of words is shared", () => {
  const said = sharedIdentifiers(
    "somebody should look at /home/somebody/secrets when there is time",
    PRIVATE,
  );
  assert.deepEqual(said, ["/home/somebody/secrets"]);
});

test("an address shared with the note comes back on its own", () => {
  const said = sharedIdentifiers(
    "reach out about this when there is time: maria@example.com",
    "ask maria@example.com whether the box stalls for her too",
  );
  assert.deepEqual(said, ["maria@example.com"]);
});

test("a short token shared with the note passes, because a word is no secret", () => {
  assert.deepEqual(sharedIdentifiers("the a.md file stands", "a.md holds it"), []);
});

// [[spec/design_output/private#a-bare-name-passes]]
test("a bare name passes, and this case exists to say so out loud", () => {
  const text = "worth asking Fnordwick about this before anybody else decides";
  assert.deepEqual(sharedIdentifiers(text, PRIVATE), []);
  assert.equal(wordsOf(longestSharedRun(text, PRIVATE)).length < COPY_RUN, true);
  assert.equal(carriedFrom(text, noted(PRIVATE)), null);
});

// [[spec/design_output/private#the-door-reads-the-notes]]
test("the door names the note a write shares a run with", () => {
  const said = carriedFrom(`Noticed: ${WORDY}`, noted(WORDY));
  assert.equal(said.how, "run");
  assert.equal(said.note, "one.md");
  assert.match(said.said, /stalls badly whenever somebody starts it/);
});

test("the door names the token a write carries alone", () => {
  const said = carriedFrom("look under /home/somebody/secrets sometime", noted(PRIVATE));
  assert.equal(said.how, "token");
  assert.equal(said.said, "/home/somebody/secrets");
});

test("the token answers before the run, because one word is the smaller ask", () => {
  const said = carriedFrom(`Noticed: ${PRIVATE}`, noted(PRIVATE));
  assert.equal(said.how, "token");
});

test("a write sharing nothing with any note passes the door", () => {
  assert.equal(carriedFrom("a repeated run stalls the box", noted(PRIVATE)), null);
  assert.equal(carriedFrom("anything at all", []), null);
});

// [[spec/design_output/private#what-the-refusal-says]]
test("the refusal quotes the run and names the road back", () => {
  const said = refusedPrivate(
    "spec/funnel/a.md",
    carriedFrom(`Noticed: ${WORDY}`, noted(WORDY)),
  );
  assert.match(said, /spec\/funnel\/a\.md carries \d+ words straight from a note/);
  assert.match(said, /stalls badly whenever somebody starts it/);
  assert.match(said, /\.se\/notes/);
});

test("the refusal over a token says one word is enough to leak", () => {
  const said = refusedPrivate(
    "spec/funnel/a.md",
    carriedFrom("look under /home/somebody/secrets sometime", noted(PRIVATE)),
  );
  assert.match(said, /"\/home\/somebody\/secrets"/);
  assert.match(said, /one word is enough to leak/);
});
