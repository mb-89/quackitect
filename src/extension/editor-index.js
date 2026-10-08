// The index door: the catalog's values and its actions over /v1, at the port
// the index's standing file names. It answers nothing where no index stands.
// [[spec/design_output/extension#the-views-section]]

const { join } = require("node:path");

// The file standingPath in src/index/door.go writes, in the runtime folder src/modules/check/folders.go owns, spelled again here because the extension imports its own folder alone. [[spec/design_output/model#surfaces]]
const STANDING = [".se", ".runtime", "index.json"];
// The pause before a watch opens again, since the index restarts under a window. [[spec/tickets/the-sidebar-reads-v1]]
const REOPEN = 2000;
// What a verb's action answers where no index stands. [[spec/tickets/the-lens-calls-actions]]
const NO_INDEX =
  "no index answers at this tree, and ./RUNME.sh index standing starts one";
// The seconds a person's press waits on its verb, past which the answer names the handle to read. [[spec/design_output/model#a-caller-sets-its-wait]]
const ACT_WAIT = 600;
// The status codes fetch reads as ok, the 2xx span. [[spec/design_output/doors#one-door-per-outside-thing]]
const OK = 200;
const REDIRECT = 300;

// [[spec/design_output/extension#the-views-section]]
function indexDoor(root, doors) {
  const base = () => {
    try {
      const port = JSON.parse(doors.disk.read(join(root, ...STANDING)))?.v1;
      return port ? `http://127.0.0.1:${port}/v1` : "";
    } catch {
      return "";
    }
  };
  const answered = async (path, init) => {
    const at = base();
    if (!at) return undefined;
    try {
      const said = await doors.http.send(`${at}${path}`, init);
      return {
        ok: said.status >= OK && said.status < REDIRECT,
        body: bodyOf(said.text),
      };
    } catch {
      return undefined;
    }
  };
  const asks = async (path, init) => {
    const said = await answered(path, init);
    return said?.ok ? said.body : undefined;
  };
  // Each named value once, then each change, one call of fn an event, until stop. [[spec/tickets/the-sidebar-reads-v1]]
  const watch = (names, fn) => {
    const aborts = new AbortController();
    const opens = async () => {
      if (aborts.signal.aborted) return;
      const at = base();
      try {
        if (at) {
          // level0: OutsideInDoors - the http door answers a whole body as text, and a watch reads an event stream that runs on
          const said = await fetch(`${at}/watch?names=${names.join(",")}`, {
            signal: aborts.signal,
          });
          if (said.ok && said.body) await eventsIn(said.body, fn);
        }
      } catch {}
      if (!aborts.signal.aborted) doors.clock.after(REOPEN, opens, { unref: true });
    };
    opens();
    return { stop: () => aborts.abort() };
  };
  return {
    watch,
    values: async (name) => (await asks(`/values/${name}`))?.value,
    calls: (name, input) => asks(`/actions/${name}`, posted(input)),
    // A verb's action, answered as a run: its output on a 200, and the problem's detail, which carries the verb's output, on a refusal. [[spec/tickets/the-lens-calls-actions]]
    acts: async (name, input) => {
      const said = await answered(`/actions/${name}`, posted(input, ACT_WAIT));
      if (!said) return { code: 1, out: "", err: NO_INDEX };
      if (said.ok && said.body?.running)
        return {
          code: 0,
          out: `wait\n${name} runs on at ${said.body.handle}`,
          err: "",
        };
      if (said.ok) return { code: 0, out: textOf(said.body?.result), err: "" };
      return { code: 1, out: "", err: String(said.body?.detail ?? "") };
    },
  };
}

function posted(input, wait) {
  return {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(wait ? { prefer: `wait=${wait}` } : {}),
    },
    body: JSON.stringify(input ?? {}),
  };
}

function bodyOf(text) {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function textOf(result) {
  if (result === undefined || result === null) return "";
  return typeof result === "string" ? result : JSON.stringify(result);
}

// Reads a server-sent stream, and hands each event's name and value to fn. [[spec/tickets/the-sidebar-reads-v1]]
async function eventsIn(body, fn) {
  const decoder = new TextDecoder();
  let held = "";
  for await (const part of body) {
    held += decoder.decode(part, { stream: true });
    let end = held.indexOf("\n\n");
    while (end >= 0) {
      const data = held
        .slice(0, end)
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice("data:".length).trim())
        .join("\n");
      held = held.slice(end + 2);
      if (data) {
        const event = JSON.parse(data);
        await fn(event.name, event.value);
      }
      end = held.indexOf("\n\n");
    }
  }
}

module.exports = { indexDoor };
