// FIVE PRESSES ON IDEATION ARM EMERGENCY — executed, not read.
//
// This is the first test in the battery that RUNS the mirror's client-side
// code. Everything else imports a module and asserts on a returned string, so
// the whole click layer shipped unverified: the reader was the test suite, and
// the emergency drumroll reached them broken twice.
//
// It was not subtly broken either. `data-level` is baked into the markup at
// render time, so once press one released the rung the button still carried
// "go to 0.6" until a poll redrew it. Every later press re-sent 0.6, the rung
// never relit, and the press counter — which only counted while the rung was
// lit — stuck at one. No number of presses could ever arm it.
//
// HOW IT WORKS. The client script is one big template literal with no
// interpolation, so it is real JavaScript text. The whole script cannot boot
// under a stub (it draws SVG and reads layout), so this slices out the one
// listener under test by brace-matching and runs THAT with a small stub DOM.
// The slice is asserted to be plausible first — a silently empty extraction
// would make every assertion below vacuous.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { SCRIPT } from "../engine/render.ts";

/** Cut out the `document.addEventListener("click", ...)` that owns the rungs. */
function rungClickHandler(): string {
  const marker = SCRIPT.indexOf(".rung[data-level]");
  assert.ok(marker > 0, "the rung click handler is gone from the client script");
  const start = SCRIPT.lastIndexOf('document.addEventListener("click"', marker);
  assert.ok(start > 0, "the rung handler is no longer inside a click listener");
  let depth = 0;
  let i = SCRIPT.indexOf("{", start);
  const open = i;
  for (; i < SCRIPT.length; i++) {
    const c = SCRIPT[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) break;
    }
  }
  const body = SCRIPT.slice(open + 1, i);
  assert.ok(body.length > 400, `the extracted handler is implausibly short (${body.length} chars)`);
  assert.ok(body.includes("__seTopPresses"), "the extracted handler does not contain the drumroll");
  return body;
}

interface Press {
  posts: { url: string; body: unknown }[];
  press: (times: number, gapMs?: number) => Promise<void>;
  button: { classes: Set<string>; text: string };
}

/** The arm chains its two posts, so the assertions wait a turn for them. */
function flush(): Promise<void> {
  return new Promise((r) => setImmediate(r));
}

/**
 * A stub DOM holding exactly what this handler touches. Time is INJECTED
 * rather than real, so the window can be tested without sleeping.
 */
function harness(): Press {
  const body = rungClickHandler();
  const posts: { url: string; body: unknown }[] = [];
  const classes = new Set(["rung", "on", "danger"]);
  const btn = {
    dataset: { rung: "1", level: "0.6" },
    textContent: "I",
    classList: {
      add: (c: string) => void classes.add(c),
      remove: (c: string) => void classes.delete(c),
      contains: (c: string) => classes.has(c),
      toggle: (c: string, on?: boolean) => void (on ? classes.add(c) : classes.delete(c)),
    },
    closest(sel: string) {
      // Only the rung selector matches; every earlier branch must miss.
      return sel.includes("rung") ? this : null;
    },
  };
  const thr = { value: "1" };
  let clock = 1_000_000;
  const win: Record<string, unknown> = {};
  const listeners: ((ev: unknown) => void)[] = [];

  const doc = {
    addEventListener: (_t: string, fn: (ev: unknown) => void) => void listeners.push(fn),
    getElementById: (id: string) => (id === "thr" ? thr : null),
    querySelector: () => null,
    querySelectorAll: () => [btn],
  };

  const fetchStub = (url: string, opts: { body?: string }) => {
    posts.push({ url, body: opts && opts.body ? JSON.parse(opts.body) : null });
    return Promise.resolve({ ok: true });
  };

  // levelHelp / nrHelp / refreshLog belong to the rest of the page.
  const fn = new Function(
    "document",
    "window",
    "fetch",
    "Date",
    "levelHelp",
    "nrHelp",
    "refreshLog",
    `document.addEventListener("click", (ev) => {${body}});`,
  );
  fn(
    doc,
    win,
    fetchStub,
    { now: () => clock },
    () => {},
    () => {},
    () => {},
  );

  return {
    posts,
    button: {
      get classes() {
        return classes;
      },
      get text() {
        return btn.textContent;
      },
    },
    press: async (times: number, gapMs = 200) => {
      for (let k = 0; k < times; k++) {
        clock += gapMs;
        for (const l of listeners) l({ target: btn });
        await flush();
      }
    },
  };
}

describe("the emergency drumroll", () => {
  test("five presses on ideation arm it", async () => {
    const h = harness();
    await h.press(5);
    const emergency = h.posts.filter((p) => p.url === "/emergency");
    assert.equal(emergency.length, 1, `expected exactly one arm, got posts: ${h.posts.map((p) => p.url).join(", ")}`);
    assert.deepEqual(emergency[0].body, { on: true });
  });

  test("four presses do not", async () => {
    const h = harness();
    await h.press(4);
    assert.ok(!h.posts.some((p) => p.url === "/emergency"), "it armed early");
  });

  test("the autonomy goes back to the top BEFORE arming", async () => {
    // The engine refuses emergency below the top rung, and the presses on the
    // way here dragged the autonomy down. A refused arm looks like a dead
    // button, which is the whole complaint this test exists for.
    const h = harness();
    await h.press(5);
    const armAt = h.posts.findIndex((p) => p.url === "/emergency");
    const topAt = h.posts.findIndex((p) => p.url === "/autonomy" && (p.body as { value: number }).value === 1);
    assert.ok(topAt >= 0, "the autonomy was never put back to the top");
    assert.ok(topAt < armAt, "the arm was sent before the autonomy was restored");
  });

  test("the button paints itself E at once, without waiting for a poll", async () => {
    const h = harness();
    await h.press(5);
    assert.equal(h.button.text, "E");
    assert.ok(h.button.classes.has("emergency"), "the button did not go red");
    assert.ok(h.button.classes.has("on"), "an unlit E would read as disarmed");
  });

  test("presses spread past the window do not accumulate", async () => {
    const h = harness();
    await h.press(4, 6000);
    await h.press(1, 6000);
    assert.ok(!h.posts.some((p) => p.url === "/emergency"), "a slow drumroll must not arm");
  });

  test("five presses arm it from a LOCKED rung", async () => {
    // THE CONTRACT, in the owner's words: five clicks on I go to emergency,
    // whatever rung the autonomy sits at. From mechanical the top rung is
    // locked, and the locked guard used to swallow every click before the
    // counter saw it — so no number of presses could ever arm it.
    const h = harness();
    h.button.classes.delete("on");
    h.button.classes.add("locked");
    await h.press(5);
    assert.ok(
      h.posts.some((p) => p.url === "/emergency"),
      "a locked rung swallowed the drumroll",
    );
  });

  test("the count survives a press that lands while the rung is dark", async () => {
    // THE BUG THIS FILE WAS WRITTEN FOR. The rung goes dark on press one and
    // the stale data-level keeps it dark, so counting only while lit could
    // never reach five.
    const h = harness();
    h.button.classes.delete("on");
    await h.press(5);
    assert.ok(
      h.posts.some((p) => p.url === "/emergency"),
      "presses stopped counting once the rung went dark",
    );
  });
});
