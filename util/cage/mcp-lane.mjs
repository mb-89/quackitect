// THE TOOL LANE, STARTED FROM A FRESH CLONE.
//
// A cloud session cloned this tree and could not make a first move. The harness
// read .mcp.json, tried to spawn the tool lane, and answered ENOENT. With no
// lane there is no se_answer, no se_stop and no se_pull, so every guard refused
// every call and named a tool that was not there. The session had no door.
//
// THE CONFIG NAMED A BUILD ARTEFACT. .bin is not in version control, and the
// harness reads the MCP config and spawns the server before SessionStart can
// run the installer. So the one file that decides whether an agent has a lane
// pointed at something a clone does not carry.
//
// SO IT NAMES THIS, WHICH GIT CARRIES.
//
// AND THE BUILD GOES BEHIND THE ANSWER, NEVER IN FRONT OF IT. Naming this file
// was half the repair, and the half that was missing cost a whole session. This
// script ran the installer synchronously before it handed over, and a harness
// gives an MCP server thirty seconds to answer initialize. A cold clone spent
// those thirty seconds compiling, the harness killed the spawn, and the session
// this file exists to repair had no lane again. Moving .mcp.json off .bin never
// touched the ordering, and the ordering was the bug.
//
// So this speaks the protocol itself while the build runs. initialize is
// answered here, at once, out of a file git carries. Everything after it is
// held until the lane is up and then handed over in the order it arrived. No
// timeout can decide whether a session has a door, because the door answers
// before there is anything behind it.
//
// WHY node AND NOT sh. This has to start on a Linux container and on a Windows
// desktop from one committed line. A shell script needs sh on PATH, and Git for
// Windows does not put it there. node is on PATH wherever Claude Code runs,
// because Claude Code runs on it.
//
//   node util/cage/mcp-lane.mjs --method . --work .
import { existsSync, mkdirSync, openSync, readFileSync, statSync, writeSync } from "node:fs";
import { spawn } from "node:child_process";
import { delimiter, dirname, join } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const windows = process.platform === "win32";

// BOTH NAMES ARE THE SAME FILE once the installer has linked them, and before
// it has, only the platform's own name is there.
const suffix = windows ? ".exe" : "";
const laneExe = join(root, ".bin", "se-mcp" + suffix);
const engineExe = join(root, ".bin", "se" + suffix);

// THE LANE THIS SCRIPT BUILDS FOR ITSELF HAS ITS OWN NAME, so it never writes
// the file the installer is writing. Two builds racing for one path leave a
// half-written program, and on Windows the running one holds the name and the
// installer's build fails against it.
const ownExe = join(root, ".bin", "se-mcp.lane" + suffix);

// THE STUB KEEPS A LOG THE AGENT CAN READ. Everything it says goes to standard
// error, which the harness keeps in a log of its own that no agent on a cloud
// box can open: a session lost its lane and could say nothing about how,
// because every word about it had gone there. So it goes under .se as well,
// with the installer's and the build's output behind it, and
// util/cage/diagnose.mjs reads it back. The last line is where the stub got to.
const laneLog = join(root, ".se", "lane.out");
let log = 2;
try {
  mkdirSync(join(root, ".se"), { recursive: true });
  log = openSync(laneLog, "a");
} catch {
  // a tree that cannot take a log still gets a lane
}

// THE LIST THE COLD DOOR ANSWERS FROM. The lane's tools are static, so the
// snapshot .bin/se-mcp --tools writes is answered at once, before there is a
// lane to ask, and util/checks/mcp-tools.mjs holds it against the lane.
const toolsSnapshot = join(root, "util", "cage", "tools.json");

// STANDARD OUTPUT IS THE PROTOCOL. Everything this script says goes to standard
// error, or the harness reads it as a message from the server.
const say = (line) => {
  process.stderr.write("quackitect: " + line + "\n");
  if (log !== 2) {
    try {
      writeSync(log, new Date().toISOString() + " " + line + "\n");
    } catch {
      // the log is a convenience, and the lane is not
    }
  }
};
process.stdout.on("error", () => {}); // a shut pipe has nobody left to tell

if (existsSync(laneExe) && existsSync(engineExe)) {
  handOver(laneExe);
} else {
  answerWhileItBuilds();
}

// handOver is the whole program on a tree that is built: stdio is inherited, so
// the lane speaks to the harness directly and nothing here sits between them.
function handOver(exe) {
  say("built already, handing over to " + exe);
  const lane = spawn(exe, process.argv.slice(2), { stdio: "inherit" });
  lane.on("error", (err) => {
    say("the tool lane would not start: " + err.message);
    process.exit(1);
  });
  lane.on("exit", (code, signal) => process.exit(signal ? 1 : code ?? 0));
}

// answerWhileItBuilds is the cold clone: a door that answers now, and a lane
// that arrives behind it.
function answerWhileItBuilds() {
  say("nothing is built here yet. The door answers now and the build runs behind it.");

  const held = []; // client messages waiting for a lane, in the order they came
  let lane = null; // the built lane, once it is up
  let open = false; // true once the held messages are through and lines go straight on
  let broken = ""; // why the lane will never come up, once that is known
  let clientInit = null; // what the harness asked for, to ask the lane the same
  let engineHere = false;
  const ourID = "quackitect-lane-initialize";

  const send = (msg) => process.stdout.write(JSON.stringify(msg) + "\n");
  const answer = (id, result) => send({ jsonrpc: "2.0", id, result });
  const told = (s) => ({ content: [{ type: "text", text: s }] });
  const read = (line) => {
    try {
      return JSON.parse(line);
    } catch {
      return null; // a line that is not a message is not ours to complain about
    }
  };

  // A REFUSAL IS AN ANSWER AND A HANG IS NOT. Once the build has failed there is
  // nothing left to wait for, so every held call is told so, and told where the
  // door still is.
  const refuse = (msg) => {
    if (msg === null || msg.id === undefined) return;
    const text =
      "THIS SESSION HAS NO TOOL LANE. " + broken +
      "\n\nThe engine is still a door. At a shell, ./RUNME.sh <verb> is the same " +
      "call and the guards let it through. To build by hand, run " +
      "util/setup/install.sh and start a new session. To see why this one has no " +
      "lane, node util/cage/diagnose.mjs writes a diagnosis under .se/scratchpad, " +
      "and it goes in your answer whole.";
    if (msg.method === "tools/call") answer(msg.id, told(text));
    else send({ jsonrpc: "2.0", id: msg.id, error: { code: -32603, message: text } });
  };

  const stillBuilding =
    "THE ENGINE IS STILL BEING BUILT, so this call was not made and nothing was " +
    "done. The first build compiles SQLite, which takes a few minutes, once. Ask " +
    "again in a minute. .se/lane.out says how far the build has got.";

  createInterface({ input: process.stdin })
    .on("line", (line) => {
      if (open) {
        // A CALL NEEDS THE ENGINE AND A LIST NEEDS ONLY THE LANE. The lane comes
        // up first, so tools/list is answered while the engine is still
        // building, and a call made in that window is told to wait rather than
        // handed to a program that would answer about a missing file.
        if (!engineHere) {
          engineHere = existsSync(engineExe);
          if (!engineHere) {
            const msg = read(line);
            if (msg !== null && msg.method === "tools/call" && msg.id !== undefined) {
              answer(msg.id, told(stillBuilding));
              return;
            }
          }
        }
        lane.stdin.write(line + "\n");
        return;
      }
      const raw = line.trim();
      if (raw === "") return;
      const msg = read(raw);
      if (msg === null) return;

      // INITIALIZE IS ANSWERED FROM HERE, AT ONCE. This is the handshake the
      // thirty seconds are for, and answering it is what buys the build its
      // time.
      if (msg.method === "initialize" && msg.id !== undefined) {
        clientInit = msg.params ?? {};
        answer(msg.id, {
          // The client's version is echoed back, which is what the lane itself
          // does. Choosing one here is how a stub stops working when a harness
          // moves on.
          protocolVersion: clientInit.protocolVersion || "2025-06-18",
          // THE LIST CHANGES, because a moment ago there was no lane to ask.
          capabilities: { tools: { listChanged: true } },
          serverInfo: { name: "quackitect", version: "0.1.0" },
        });
        return;
      }
      // A PING IS A QUESTION ABOUT THIS PROCESS and not about the lane, so it is
      // answered here whatever the build is doing.
      if (msg.method === "ping" && msg.id !== undefined) {
        answer(msg.id, {});
        return;
      }
      // A NOTIFICATION TAKES NO ANSWER, and the lane gets a handshake of its
      // own below, so nothing the client notifies is worth holding.
      if (msg.id === undefined) return;
      // THE LIST IS ANSWERED COLD, off the snapshot. The harness asks for it
      // right behind the handshake, and a list held for a build is a session
      // that begins with no tool listed, which is the session this file
      // exists to end.
      if (msg.method === "tools/list") {
        try {
          answer(msg.id, { tools: JSON.parse(readFileSync(toolsSnapshot, "utf8")).tools });
          return;
        } catch {
          // no snapshot here, so the lane answers it when it is up
        }
      }
      if (broken !== "") {
        refuse(msg);
        return;
      }
      // A CALL BEFORE THE LANE IS UP IS ANSWERED, NOT HELD. A call held for a
      // build is a tool that hangs for minutes, and an agent reads a hang as a
      // tool that is broken. The answer says what is happening and where to
      // look.
      if (msg.method === "tools/call") {
        // se_start IS THE ONE TOOL THAT MEANS SOMETHING HERE. It is what an
        // agent calls when nothing works, and answering it with "still
        // building" would be this door refusing the question it exists to
        // answer. The build it would start is already running, so this says
        // so, in the shape se_start answers in.
        const name = msg.params?.name ?? "";
        if (name === "se_start") {
          answer(msg.id, told(JSON.stringify({
            running: false, building: true,
            says: "The engine is being built here and is not up yet. This tree carried nothing " +
              "built, so the build started with this lane, " + Math.round(waited * 0.4) +
              " seconds ago. It compiles SQLite and takes a few minutes, once. Ask again in a " +
              "minute. .se/lane.out says how far it has got. Nothing is guarding this session " +
              "meanwhile, so the harness's own tools are how you work until it answers.",
          }, null, 2)));
          return;
        }
        answer(msg.id, told(stillBuilding + " " + Math.round(waited * 0.4) + " seconds so far."));
        return;
      }
      held.push(raw);
      say("holding " + msg.method + " until the lane is up");
    })
    .on("close", () => {
      if (lane === null) process.exit(0);
      lane.stdin.end();
    });

  // THE INSTALLER IS THE BUILD. Asking go build directly for the engine would be
  // a second place that knows how this tree compiles, and it would miss the C
  // compiler the installer pins for the engine's SQLite.
  let installing = true;
  const install = windows
    ? spawn("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File",
      join(root, "util", "setup", "install.ps1"), "--profile", "headless"],
      { stdio: ["ignore", log, log] })
    : spawn("sh", [join(root, "util", "setup", "install.sh"), "--profile", "headless"],
      { stdio: ["ignore", log, log] });
  install.on("error", (err) => {
    installing = false;
    say("the installer would not start: " + err.message);
  });
  install.on("exit", () => {
    installing = false;
  });

  // THE LANE IS THE ONE PROGRAM THIS CAN BUILD ON ITS OWN. src/mcp is the
  // standard library and nothing besides, so it needs no C compiler and no
  // pinned environment, and it compiles in seconds. The installer builds the
  // engine first and the lane last, so waiting on the installer to reach the
  // lane means waiting out the whole cgo build with no tool listed at all. This
  // puts the tools in front of the agent while that runs.
  // AND IT IS TRIED AGAIN WHILE THE INSTALLER RUNS, because the first attempt
  // fails on the box this is for. A cloud clone has no go until the installer
  // puts one there, so a single attempt at the start is an attempt that always
  // misses, and the tools then wait out the whole cgo build after all. The
  // installer fetches go first, so the second or third attempt is the one that
  // works, and it costs a spawn every few seconds while nothing else can act.
  let quick = null;
  const buildTheLane = () => {
    if (quick !== null) {
      return; // one at a time, and two would race for one output file
    }
    quick = spawn("go", ["build", "-o", ownExe, "."], {
      cwd: join(root, "src", "mcp"),
      stdio: ["ignore", log, log],
    });
    quick.on("error", () => {
      quick = null; // no go on PATH yet, and the installer is putting one there
    });
    quick.on("exit", () => {
      quick = null;
    });
  };
  buildTheLane();

  // WAITING WATCHES THE FILE AND NOT THE PROCESS THAT WRITES IT. Either build
  // may be the one that gets there, and the installer goes on for a while after
  // the lane it built is usable.
  const sizes = new Map();
  const ready = (path) => {
    let size;
    try {
      size = statSync(path).size;
    } catch {
      sizes.delete(path);
      return false;
    }
    const before = sizes.get(path);
    sizes.set(path, size);
    // A PROGRAM IS READY WHEN IT HAS STOPPED GROWING. A build in progress is a
    // file that exists, and starting it half written is a lane that dies.
    return size > 0 && before === size;
  };

  let waited = 0;
  const watch = setInterval(() => {
    waited += 1;
    if (ready(ownExe)) return start(ownExe);
    if (ready(laneExe)) return start(laneExe);
    if (waited % 40 === 0) {
      say("still building, " + Math.round(waited * 0.4) + " seconds so far");
    }
    // Every few seconds, until go is there and the lane is built.
    if (installing && waited % 12 === 0) {
      buildTheLane();
    }
    // GIVING UP IS ABOUT A FILE THAT IS NOT THERE, and never about one that is
    // still being written. The installer exits a moment after the last byte of
    // the lane lands, and reading "not settled yet" as "never coming" threw the
    // built lane away on the tick after the build that made it.
    if (!installing && quick === null && !existsSync(ownExe) && !existsSync(laneExe)) {
      clearInterval(watch);
      broken = "the build finished and left no tool lane at " + laneExe + ".";
      say(broken);
      for (const raw of held.splice(0)) refuse(read(raw));
    }
  }, 400);

  // start hands the held messages to the lane and then gets out of the way.
  function start(exe) {
    clearInterval(watch);
    lane = spawn(exe, process.argv.slice(2), { stdio: ["pipe", "pipe", "inherit"] });
    lane.on("error", (err) => {
      lane = null;
      broken = "the tool lane would not start: " + err.message;
      say(broken);
      for (const raw of held.splice(0)) refuse(read(raw));
    });
    lane.on("exit", (code, signal) => process.exit(signal ? 1 : code ?? 0));

    // THE LANE GETS ITS OWN HANDSHAKE, out of what the harness asked for. The
    // lane holds no state today and would not miss one, and a door that works
    // only because the program behind it forgot to ask is a door that breaks on
    // the day it remembers.
    let handshake = true;
    createInterface({ input: lane.stdout }).on("line", (line) => {
      if (handshake) {
        const msg = read(line);
        if (msg !== null && msg.id === ourID) {
          handshake = false;
          lane.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
          for (const raw of held.splice(0)) lane.stdin.write(raw + "\n");
          open = true;
          say("the tool lane is up.");
          // The list was answered by nothing a moment ago, so say that it moved.
          send({ jsonrpc: "2.0", method: "notifications/tools/list_changed" });
          return;
        }
      }
      process.stdout.write(line + "\n");
    });
    lane.stdin.write(JSON.stringify({
      jsonrpc: "2.0", id: ourID, method: "initialize", params: clientInit ?? {},
    }) + "\n");
  }
}
