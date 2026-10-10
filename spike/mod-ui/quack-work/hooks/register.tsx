// Spike: the work state the TUI shows, drawn as a pane, a band above the prompt
// and a status line. Every value comes from the index's /v1 door; the mod holds
// no work logic of its own. A read takes the host's fetch, and curl where the
// host refuses. "Pull for me" is the sidebar's work/pull action. `seen` keeps
// renders, fetch times and render lag for spike/mod-ui/REPORT.md.

import { atom, read, update } from "claude-code";
import type { EngineInterface, Register } from "claude-code";

import type { QuackLog, QuackRow, QuackSnapshot, QuackYours } from "../types";

type Engine = EngineInterface;

const PANE = "quack-work";
const INDEX = ".se/.runtime/index.json";
const PLAN = ".se/.runtime/plan.json";
const EVIDENCE_DIR = ".se/mod-ui";
const EVIDENCE = ".se/mod-ui/seen.json";
const TICK_MS = 5000;
const LOG_ROWS = 8;
const QUEUE_ROWS = 8;

const snap = atom({ plugin: "quack-work", key: "snap" } as const, null);
const shown = atom({ plugin: "quack-work", key: "shown" } as const, null);
const said = atom({ plugin: "quack-work", key: "said" } as const, "");

const seen = {
  renders: {} as Record<string, number>,
  attaches: [] as string[],
  fetchMs: [] as number[],
  lagMs: {} as Record<string, number[]>,
  surfaces: [] as string[],
  errors: [] as string[],
};
const lastStamp: Record<string, number> = {};

function saw(surface: string, component: string, stamp: number | undefined, now: number) {
  const key = `${surface}/${component}`;
  seen.renders[key] = (seen.renders[key] ?? 0) + 1;
  if (stamp && lastStamp[key] !== stamp) {
    lastStamp[key] = stamp;
    (seen.lagMs[key] ??= []).push(now - stamp);
    if (seen.lagMs[key].length > 50) seen.lagMs[key].shift();
  }
}

function cut(text: string, room: number): string {
  return text.length <= room ? text : `${text.slice(0, Math.max(1, room - 1))}…`;
}

async function base($: Engine): Promise<string> {
  const index = JSON.parse(String(await $.fs.read(INDEX)));
  return `http://127.0.0.1:${index.v1}/v1`;
}

async function value($: Engine, root: string, name: string, via: string[]): Promise<unknown> {
  const url = `${root}/values/${name}`;
  try {
    const got = await $.http.fetch(url);
    if (!got.ok) throw new Error(`${name}: HTTP ${got.status}`);
    via.push("fetch");
    return JSON.parse(got.text).value;
  } catch (fault) {
    const ran = await $.process.run(["curl", "-sf", url]);
    if (ran.exitCode !== 0) throw new Error(`${name}: ${String(fault)}; curl exit ${ran.exitCode}`);
    via.push("curl");
    return JSON.parse(ran.stdout).value;
  }
}

async function planned($: Engine): Promise<string> {
  try {
    return String(JSON.parse(String(await $.fs.read(PLAN)))?.working ?? "");
  } catch {
    return "";
  }
}

async function refresh($: Engine): Promise<void> {
  const started = await $.clock.now();
  const via: string[] = [];
  try {
    const root = await base($);
    const [rows, yours, open, log] = await Promise.all([
      value($, root, "work/rows", via),
      value($, root, "work/yours", via),
      value($, root, "work/open-tasks", via),
      value($, root, "log/rows", via),
    ]);
    const branch = (await $.process.run(["git", "branch", "--show-current"])).stdout.trim();
    const now = await planned($);
    const live = (rows as QuackRow[])
      .filter(row => row.state !== "closed")
      .map(row => ({
        name: row.name,
        kind: row.kind,
        state: row.state,
        step: row.step ?? "",
        progress: row.progress ?? "",
        group: row.group ?? "",
        urgent: !!row.urgent,
        person: !!row.person,
        path: row.path ?? "",
      }));
    const surfaces = [...(await $.session.surfaces())];
    const ms = (await $.clock.now()) - started;
    seen.fetchMs.push(ms);
    if (seen.fetchMs.length > 100) seen.fetchMs.shift();
    seen.surfaces = [...new Set([...seen.surfaces, ...surfaces])];
    const next: QuackSnapshot = {
      isOk: true,
      error: "",
      via: [...new Set(via)].join("+"),
      ms,
      stamp: await $.clock.now(),
      branch,
      open: Number(open) || 0,
      now,
      step: live.find(row => row.name === now)?.step ?? "",
      rows: live,
      yours: (yours as QuackYours[]).slice(0, QUEUE_ROWS).map(row => ({
        ticket: row.ticket,
        path: row.path,
        step: row.step,
        queue: String(row.queue ?? ""),
      })),
      log: (log as QuackLog[]).slice(-LOG_ROWS).map(row => ({
        at: row.at,
        level: row.level,
        kind: row.kind,
        said: row.said,
      })),
      surfaces,
    };
    await update($, snap, () => next);
    $.ui.status(`quack · ${next.open} open · now ${next.now || "-"}${next.step ? ` / ${next.step}` : ""}`);
  } catch (fault) {
    seen.errors.push(String(fault).slice(0, 300));
    if (seen.errors.length > 20) seen.errors.shift();
    await update($, snap, old => ({
      ...(old ?? emptySnap()),
      isOk: false,
      error: String(fault).slice(0, 300),
      stamp: started,
    }));
  }
  await $.fs.write(EVIDENCE, JSON.stringify(seen, null, 1)).catch(() => {});
}

function emptySnap(): QuackSnapshot {
  return {
    isOk: false,
    error: "",
    via: "",
    ms: 0,
    stamp: 0,
    branch: "",
    open: 0,
    now: "",
    step: "",
    rows: [],
    yours: [],
    log: [],
    surfaces: [],
  };
}

async function show($: Engine, name: string, path: string): Promise<void> {
  let text = "";
  try {
    const root = await base($);
    const got = (await value($, root, `files/${path}`, [])) as { text?: string } | null;
    text = String(got?.text ?? "");
  } catch {
    text = "";
  }
  if (!text) text = String(await $.fs.read(path).catch(() => `${path}: nothing to read`));
  await update($, shown, () => ({ name, text }));
}

async function pullForMe($: Engine): Promise<void> {
  try {
    const root = await base($);
    const got = await $.http.fetch(`${root}/actions/work/pull`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "wait=15" },
      body: "{}",
    });
    if (!got.ok) throw new Error(`work/pull: HTTP ${got.status}`);
    const answer = JSON.parse(got.text || "{}");
    const pulled = typeof answer.result === "string" ? JSON.parse(answer.result || "{}") : answer.result;
    if (!pulled?.ticket) {
      await update($, said, () => "pull: nothing waits on you");
    } else {
      await update($, said, () => `pull: ${pulled.ticket} at ${pulled.step}`);
      await show($, pulled.ticket, pulled.path);
    }
  } catch (fault) {
    await update($, said, () => `pull failed: ${String(fault).slice(0, 200)}`);
  }
  await refresh($);
}

function openPane($: Engine) {
  return $.ui.open({ id: PANE, title: "Work" });
}

function pathOf(snapshot: QuackSnapshot | null, name: string): string {
  const row = snapshot?.rows.find(one => one.name === name);
  const mine = snapshot?.yours.find(one => one.ticket === name);
  return row?.path || mine?.path || `spec/tickets/${name}.md`;
}

export const register: Register = on => {
  on("session.start", async ($, e, next) => {
    await $.command.register({ name: "quack", description: "Show the work pane: queue, current ticket, log" });
    await $.command.register({
      name: "quack-show",
      description: "Show one ticket in the work pane",
      argumentHint: "<ticket>",
    });
    await $.command.register({ name: "quack-bench", description: "Time each index read the work pane makes" });
    await $.command.register({ name: "quack-watch", description: "Stream the index's watch for five seconds" });
    await $.process.run(["mkdir", "-p", EVIDENCE_DIR]).catch(() => undefined);
    $.clock.every(TICK_MS, () => void refresh($));
    void refresh($);
    return next(e);
  });

  on("command.run", { command: "quack-bench" }, async $ => {
    const root = await base($);
    const lines: string[] = [];
    for (const name of ["work/open-tasks", "work/yours", "log/rows", "work/rows"]) {
      const fetched: number[] = [];
      const curled: number[] = [];
      for (let round = 0; round < 5; round++) {
        let at = await $.clock.now();
        await $.http.fetch(`${root}/values/${name}`);
        fetched.push((await $.clock.now()) - at);
        at = await $.clock.now();
        await $.process.run(["curl", "-sf", "-o", "/dev/null", `${root}/values/${name}`]);
        curled.push((await $.clock.now()) - at);
      }
      lines.push(`${name}: $.http.fetch ${fetched.join("/")} ms, curl via $.process.run ${curled.join("/")} ms`);
    }
    let at = await $.clock.now();
    await refresh($);
    lines.push(`one refresh: ${(await $.clock.now()) - at} ms`);
    at = await $.clock.now();
    await update($, said, () => `bench ${at}`);
    lines.push(`one state write: ${(await $.clock.now()) - at} ms`);
    return { text: lines.join("\n") };
  });

  on("command.run", { command: "quack-watch" }, async $ => {
    const root = await base($);
    const started = await $.clock.now();
    const events: string[] = [];
    const child = $.process.spawn({ argv: ["curl", "-sN", `${root}/watch?names=work/open-tasks,log/rows`] });
    for await (const piece of child) {
      const at = (await $.clock.now()) - started;
      for (const line of piece.text.split("\n")) {
        if (line.startsWith("data:")) events.push(`${at} ms: ${cut(line.slice(5).trim(), 60)}`);
      }
      if (at > 5000 || events.length >= 6) break;
    }
    return { text: [`/v1/watch through $.process.spawn, ${events.length} events:`, ...events].join("\n") };
  });

  on("session.attach", async ($, e, next) => {
    seen.attaches.push(`${e.surface}:${e.viewport?.columns ?? "?"}x${e.viewport?.rows ?? "?"}`);
    return next(e);
  });

  on("command.run", { command: "quack" }, async $ => {
    await refresh($);
    const opened = await openPane($);
    return { text: opened.isPlaced ? "Work pane opened." : `Work pane waits: ${opened.reason}` };
  });

  on("command.run", { command: "quack-show" }, async ($, e) => {
    const name = e.args.trim();
    if (!name) return { text: "Name a ticket: /quack-show <ticket>" };
    await show($, name, pathOf(await read($, snap), name));
    await openPane($);
    return { text: `Showing ${name} in the work pane.` };
  });

  on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
    const s = await read($, snap);
    if (!s || e.props.hasSurvey) return next(e);
    saw(e.surface, "AbovePrompt", s.stamp, await $.clock.now());
    const { Box, Button, Text } = $.ui.resolve(e);
    const room = Math.max(20, e.props.bodyColumns - 10);
    const last = s.log.at(-1);
    const line = s.isOk
      ? `quack · ${s.branch} · now ${s.now || "-"}${s.step ? `/${s.step}` : ""} · ${s.open} open · ${last ? `${last.kind}: ${last.said}` : ""}`
      : `quack · index down: ${s.error}`;
    return (
      <Box>
        <Text dimColor wrap="truncate-end">
          {cut(line, room)}{" "}
        </Text>
        <Button key="open" label="Work" hotkey="w" onPress={() => void openPane($)} />
      </Box>
    );
  });

  on("ui.render", { component: "Pane", requestId: PANE }, async ($, e) => {
    const s = await read($, snap);
    const ticket = await read($, shown);
    const answer = await read($, said);
    saw(e.surface, "Pane", s?.stamp, await $.clock.now());
    const { Box, Button, Markdown, Text } = $.ui.resolve(e);
    const room = Math.max(20, e.props.bodyColumns);
    if (!s) return <Text dimColor>Reading the index…</Text>;

    const groups = s.rows.filter(row => row.kind === "group");
    const named = new Set(groups.map(group => group.name));
    const loose = s.rows.filter(row => row.kind === "ticket" && !named.has(row.group));
    const todos = s.rows.filter(row => row.kind === "todo");
    const rowButton = (row: QuackRow, indent: string) => (
      <Button key={`row:${row.name}`} plain onPress={() => void show($, row.name, row.path)}>
        {cut(`${indent}${row.name}`, room - 22)}{" "}
        <Text dimColor>
          {row.step || row.state} {row.progress}
          {row.urgent ? " urgent" : ""}
          {row.person ? " you" : ""}
        </Text>
      </Button>
    );

    return (
      <Box flexDirection="column">
        <Text dimColor>
          {s.branch} · {s.open} open · index {s.ms} ms via {s.via || "-"}
          {s.isOk ? "" : ` · down: ${s.error}`}
        </Text>
        <Text>
          Now <Text bold>{s.now || "-"}</Text>
          {s.step ? <Text dimColor> step {s.step}</Text> : null}
        </Text>
        <Text bold>Waiting on you</Text>
        {s.yours.length === 0 ? <Text dimColor>  nothing</Text> : null}
        {s.yours.map(row => (
          <Button key={`yours:${row.ticket}`} plain onPress={() => void show($, row.ticket, row.path)}>
            {cut(`  ${row.ticket}`, room - 14)} <Text dimColor>{row.step} q{row.queue}</Text>
          </Button>
        ))}
        <Text bold>Work tree</Text>
        {groups.map(group => [
          rowButton(group, "▸ "),
          ...s.rows.filter(row => row.kind === "ticket" && row.group === group.name).map(row => rowButton(row, "    ")),
        ])}
        {loose.map(row => rowButton(row, "· "))}
        {todos.length > 0 ? <Text bold>Todos</Text> : null}
        {todos.map(row => (
          <Text key={`todo:${row.name}`} dimColor>
            {cut(`  ${row.name}`, room)}
          </Text>
        ))}
        <Text bold>Log</Text>
        {s.log.map((row, at) => (
          <Text key={`log:${at}`} dimColor={row.level !== "warn" && row.level !== "error"} wrap="truncate-end">
            {cut(`  ${row.at.slice(11, 19)} ${row.kind}: ${row.said}`, room)}
          </Text>
        ))}
        <Box>
          <Button key="pull" label="Pull for me" hotkey="p" variant="primary" onPress={() => void pullForMe($)} />
          <Button
            key="ask"
            label="Ask the agent to pull"
            hotkey="a"
            onPress={() => void $.prompt.fill({ text: "Pull the next ticket." })}
          />
          <Button key="refresh" label="Refresh" hotkey="r" onPress={() => void refresh($)} />
          {ticket ? (
            <Button key="hide" label="Hide ticket" hotkey="h" onPress={() => void update($, shown, () => null)} />
          ) : null}
        </Box>
        {answer ? <Text dimColor>{cut(answer, room * 3)}</Text> : null}
        {ticket ? <Text bold>Ticket {ticket.name}</Text> : null}
        {ticket ? <Markdown key="ticket" text={ticket.text} /> : null}
      </Box>
    );
  });
};
