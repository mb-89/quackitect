// The dry probe's pure half: the engine it raises a session's events through,
// and the checks it reads off what the run leaves.
// [[spec/tickets/level0-runs-on-the-door]]

import assert from "node:assert/strict";
import { resolve } from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { HEARD } from "../../.claude/skills/level0/lib/guidance.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { RESUME } from "../../src/bridge/handover.js";
import { coldTree } from "../../src/scripts/probe-cold.js";
import { verbMain } from "../../src/scripts/cli-main.js";
import {
	DRY,
	deltaOf,
	engineOf,
	harnessOf,
	leaves,
	readsDry,
	SMOKE,
	smokeTree,
} from "../../src/scripts/probe-dry.js";

const SENTENCE =
	"level0 holds this session: 75 rules, 6 notes, the stop hook on.";

// What a whole run leaves: the door stands, the context hands the canary, the prompt reads rewritten, the tools register, the read passes and the guarded call comes back refused. [[spec/tickets/level0-runs-on-the-door]]
function whole() {
	return {
		rows: [
			{ kind: "context", said: "2 block(s) reach the session" },
			{ kind: "level0", said: HEARD.same, detail: SENTENCE },
		],
		seen: {
			door: true,
			blocks: [
				{ name: "level0-tools", text: "the tools" },
				{
					name: "level0-canary",
					text: `Open your FIRST answer with:\n\n    ${SENTENCE}`,
				},
			],
			sentence: SENTENCE,
			prompt: { text: "probe" },
			submitted: { text: "Answer first.\n\nprobe" },
			registered: ["pull", "find", "stop"],
			read: { passed: { tool: "Read" } },
			guarded: {
				deny: "The door wants a ticket name opening the description.",
			},
			posts: [{ url: "http://127.0.0.1:7001/hook", event: "session.start" }],
			said: [],
			cleared: {
				runs: [
					{
						words: "handover --pass",
						exit: 0,
						said: "Level zero clears the conversation.",
					},
				],
				commands: ["clear"],
				prompts: [RESUME],
				after: {
					pulled: "work\n  read-handover stands in your hand.",
					read: "work\n  read-handover closes.\nwork  dry-probe-leaf at do, leaf 1 of 1",
					committed: { exit: 0, said: "" },
					clears: 1,
				},
			},
		},
	};
}

const failing = (rows, seen) =>
	readsDry(rows, seen)
		.filter((one) => !one.pass)
		.map((one) => one.check);

test("a whole run passes every check the dry probe names", () => {
	const { rows, seen } = whole();
	const checks = readsDry(rows, seen);
	assert.deepEqual(
		checks.map((one) => one.check),
		DRY.checks,
	);
	assert.deepEqual(failing(rows, seen), []);
});

// [[spec/tickets/level0-smoke-runs-in-seconds]]
test("the smoke stands the clone with the root's built tools and installs nothing", () => {
	const disk = fakeDisk({
		"/r/.se/.runtime/bin/se-index": "index",
		"/r/.se/.runtime/bin/biome": "biome",
		"/r/.se/.runtime/bin/se-index.old": "old",
	});
	const proc = fakeProc({ git: { exitCode: 0 } });
	const it = { disk, proc, join: (...parts) => parts.join("/") };
	const stood = smokeTree("/r", it, () => {}, {
		temp: "/t",
		tree: "/t/tree",
		port: 7001,
		delta: "",
	});
	assert.equal(stood, true);
	assert.deepEqual(
		proc.ran.map((one) => one.argv),
		[["git", "clone", "--quiet", "--shared", "/r", "/t/tree"]],
		"one shared clone, and no install",
	);
	assert.equal(disk.read("/t/tree/.se/.runtime/bin/se-index"), "index");
	assert.equal(disk.read("/t/tree/.se/.runtime/bin/biome"), "biome");
	assert.equal(
		disk.exists("/t/tree/.se/.runtime/bin/se-index.old"),
		false,
		"a kept old build stays behind",
	);
	assert.deepEqual(JSON.parse(disk.read("/t/tree/.se/.runtime/vehicle.json")), {
		method: "/t/tree",
		port: 7001,
	});
});

// [[spec/tickets/probe-at-revision-guards-merges]]
test("the cold tree checks the clone out at the revision it names", () => {
	const proc = fakeProc({ git: { exitCode: 0 }, sh: { exitCode: 0 } });
	const it = { disk: fakeDisk({}), proc, join: (...parts) => parts.join("/") };
	coldTree("/r", it, () => {}, {
		temp: "/t",
		tree: "/t/tree",
		port: 7001,
		delta: "",
		at: "abc123",
	});
	const runs = proc.ran.map((one) => one.argv.slice(0, 5).join(" "));
	const at = runs.indexOf("git checkout --quiet --detach abc123");
	assert.ok(at > 0, `the clone checks out the revision: ${runs.join("; ")}`);
	assert.equal(proc.ran[at].init.cwd, "/t/tree");
	assert.ok(
		at < runs.findIndex((one) => one.startsWith("sh ")),
		"the checkout comes before the install",
	);
});

// [[spec/tickets/level0-smoke-runs-in-seconds]]
test("the smoke reads every check but the clear", () => {
	const { rows, seen } = whole();
	delete seen.cleared;
	const checks = readsDry(rows, seen, SMOKE.checks);
	assert.deepEqual(
		checks.map((one) => one.check),
		DRY.checks.filter((one) => one !== "clear"),
	);
	assert.deepEqual(
		checks.filter((one) => !one.pass),
		[],
	);
});

test("a context read handing no canary block fails the rules", () => {
	const { rows, seen } = whole();
	assert.deepEqual(failing(rows, { ...seen, blocks: [], sentence: "" }), [
		"rules",
	]);
});

test("a prompt the client reads as given fails the prompt check", () => {
	const { rows, seen } = whole();
	assert.deepEqual(failing(rows, { ...seen, submitted: { text: "probe" } }), [
		"prompt",
	]);
});

test("the pull alone fails the tools check", () => {
	const { rows, seen } = whole();
	assert.deepEqual(failing(rows, { ...seen, registered: ["pull"] }), ["tools"]);
});

test("a guarded call that passes, or a refusal saying level zero answers nothing, fails the guard", () => {
	const { rows, seen } = whole();
	assert.deepEqual(failing(rows, { ...seen, guarded: { passed: {} } }), [
		"guard",
	]);
	assert.deepEqual(
		failing(rows, {
			...seen,
			guarded: { deny: "Level zero refuses Bash: the index answers nothing" },
		}),
		["guard"],
	);
});

test("a post past the hooks door, or a line saying level zero answers nothing, fails quiet", () => {
	const { rows, seen } = whole();
	assert.deepEqual(
		failing(rows, {
			...seen,
			posts: [{ url: "http://127.0.0.1:6510/event", event: "env.get" }],
		}),
		["quiet"],
	);
	assert.deepEqual(
		failing(rows, {
			...seen,
			said: ["LEVEL ZERO ANSWERS NOTHING. The server"],
		}),
		["quiet"],
	);
});

test("a door that never stood, and a canary nobody heard, fail their checks", () => {
	const { rows, seen } = whole();
	assert.deepEqual(failing(rows, { ...seen, door: false }), ["door"]);
	assert.deepEqual(failing([rows[0]], seen), ["canary"]);
});

test("a read the door holds for an answer the chat never showed fails the guard", () => {
	const { rows, seen } = whole();
	assert.deepEqual(
		failing(rows, {
			...seen,
			read: { deny: "The owner sent a prompt, and nothing has answered it." },
		}),
		["guard"],
	);
});

test("the engine wraps each registration around the ones after it, reads a filter, and keeps a stream to its own", async () => {
	const order = [];
	const engine = engineOf((on) => {
		on("*", async (_$, e, next) => {
			order.push(`all:${next.event}`);
			return next({ ...e, seen: true });
		});
		on("tool.call", { tool: "pull" }, async () => ({ result: "pulled" }));
		on("turn.step", async function* (_$, e, next) {
			for await (const one of next(e)) yield { ...one, through: true };
		});
	});

	const read = await engine.raise(
		{},
		"tool.call",
		{ tool: "Read" },
		async (e) => ({
			passed: e,
		}),
	);
	const pulled = await engine.raise(
		{},
		"tool.call",
		{ tool: "pull" },
		async () => ({}),
	);
	const origin = { kind: "composer" };
	let heard;
	await engine.raise({}, "prompt.submit", {}, async () => ({}), origin);
	await engineOf((on) =>
		on("*", async (_$, e, next) => {
			heard = next.origin;
			return next(e);
		}),
	).raise({}, "prompt.submit", {}, async () => ({}), origin);
	const chunks = [];
	for await (const one of engine.raise({}, "turn.step", {}, async function* () {
		yield { kind: "text" };
	}))
		chunks.push(one);

	assert.deepEqual(read, { passed: { tool: "Read", seen: true } });
	assert.deepEqual(pulled, { result: "pulled" });
	assert.deepEqual(heard, origin, "the origin rides the next a hook reads");
	assert.deepEqual(chunks, [{ kind: "text", through: true }]);
	assert.deepEqual(order, [
		"all:tool.call",
		"all:tool.call",
		"all:prompt.submit",
	]);
});

test("the harness reads the clone's files, records each post and tool, and hands back the transcript the session keeps", async () => {
	const disk = fakeDisk({ "/t/tree/a.md": "a" });
	const it = {
		disk,
		join: (...parts) => parts.join("/").replace(/\/[^/]+\/\.\.(?=\/|$)/g, ""),
		http: { send: async () => ({ status: 503, text: "" }) },
	};
	const { $, seen } = harnessOf(it, "/t/tree", { CLAUDE_CODE_REMOTE: "true" });

	assert.equal(await $.fs.read("a.md"), "a");
	await $.fs.write(".se/x.json", "{}");
	assert.equal(disk.read("/t/tree/.se/x.json"), "{}");
	assert.equal(await $.env.get("CLAUDE_CODE_REMOTE"), "true");
	const said = await $.http.fetch("http://127.0.0.1:1/hook", {
		method: "POST",
		body: JSON.stringify({ event: "tool.call" }),
	});
	assert.equal(said.ok, false, "a 503 reads as no answer");
	await $.tool.register({ name: "find" });
	seen.held.push({ role: "assistant", id: "a1", text: "said" });

	seen.depth = 1;
	await assert.rejects(
		$.command.run({ command: "clear" }),
		/inside a hook the turn is waiting on/,
	);
	seen.depth = 0;
	await $.command.run({ command: "clear" });
	await $.prompt.submit({ text: "resume" });
	assert.deepEqual(
		seen.commands,
		["clear"],
		"a command runs outside a hook the turn holds",
	);
	assert.deepEqual(seen.prompts, ["resume"]);

	assert.deepEqual(seen.posts, [
		{ url: "http://127.0.0.1:1/hook", event: "tool.call" },
	]);
	assert.deepEqual(seen.registered, ["find"]);
	assert.deepEqual(await $.session.messages(), [
		{ role: "assistant", id: "a1", text: "said" },
	]);
});

// [[spec/tickets/program-of-drops-node]]
// [[spec/tickets/the-doors-pr-goes-green]]
test("a temp tree the box still holds stays named, and the probe's verdict stands", () => {
	const said = [];
	const busy = Object.assign(new Error("resource busy or locked"), {
		code: "EBUSY",
	});
	const held = {
		disk: {
			remove: () => {
				throw busy;
			},
		},
	};
	leaves(held, "/tmp/se-dry-1", (line) => said.push(line));
	assert.deepEqual(said, ["the temp tree stays at /tmp/se-dry-1: EBUSY"]);
	const gone = [];
	leaves(
		{ disk: { remove: (path) => gone.push(path) } },
		"/tmp/se-dry-2",
		(line) => said.push(line),
	);
	assert.deepEqual(gone, ["/tmp/se-dry-2"]);
	assert.equal(said.length, 1);
});

test("the probe's main runs nothing where another program is main", async () => {
	let ran = false;
	// A URL with no drive letter refuses fileURLToPath on Windows, so the path resolves first. [[spec/tickets/the-doors-pr-goes-green]]
	await verbMain(pathToFileURL(resolve("/elsewhere/probe-dry.js")).href, () => {
		ran = true;
	});
	assert.equal(ran, false);
});

// [[spec/tickets/every-named-path-resolves]]
test("the delta carries each untracked file as a new-file patch after the tracked diff", () => {
	const added =
		"diff --git a/src/q/new.go b/src/q/new.go\nnew file mode 100644\n";
	const proc = {
		run: (args) => {
			if (args[1] === "ls-files")
				return { exitCode: 0, stdout: "src/q/new.go\0", stderr: "" };
			if (args.includes("--no-index")) {
				assert.deepEqual(args.slice(-2), ["/dev/null", "src/q/new.go"]);
				return { exitCode: 1, stdout: added, stderr: "" };
			}
			return { exitCode: 0, stdout: "tracked\n", stderr: "" };
		},
	};
	assert.equal(deltaOf({ proc }, "/tree"), `tracked\n${added}`);
});
