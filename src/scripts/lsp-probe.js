// The probe behind the doctor's `se-lsp lsp` row. It starts the server the
// editor starts, opens one note, and reads back what the server draws.
// [[spec/design_output/lsp#the-doctor-probes-the-server]]

import { join } from "node:path";
import { pathToFileURL } from "node:url";

// The note the probe opens, under the ticket folder with no frontmatter, so a server that reads the tree answers at least one diagnostic. [[spec/design_output/lsp#the-doctor-probes-the-server]]
const PROBE_NOTE = "spec/tickets/doctor-probe.md";
const PROBE_TEXT = "# Probe\n";
// The span the probe waits on the server, past the half second a warm one takes. [[spec/design_output/lsp#the-doctor-probes-the-server]]
const PROBE_WAIT = 30_000;

function framed(said) {
  const body = JSON.stringify({ jsonrpc: "2.0", ...said });
  return `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`;
}

// The row `se-lsp lsp` draws: the probe starts the server the editor starts, opens one note, and names each diagnostic code the server sends back. [[spec/design_output/lsp#the-doctor-probes-the-server]]
export function lspProbe(door, exe, at) {
  if (!exe) return "missing, run ./RUNME.sh";
  const uri = pathToFileURL(join(at, ...PROBE_NOTE.split("/"))).href;
  const stdin = [
    framed({ id: 1, method: "initialize", params: { rootUri: pathToFileURL(at).href, capabilities: {} } }),
    framed({
      method: "textDocument/didOpen",
      params: { textDocument: { uri, languageId: "markdown", version: 1, text: PROBE_TEXT } },
    }),
    framed({ id: 2, method: "shutdown" }),
    framed({ method: "exit" }),
  ].join("");
  let ran;
  try {
    ran = door.run([exe, "lsp"], { cwd: at, stdin, timeoutMs: PROBE_WAIT });
  } catch (error) {
    ran = { exitCode: 1, stdout: "", stderr: String(error?.message ?? error) };
  }
  const drawn = diagnosticsIn(ran.stdout);
  if (ran.exitCode !== 0 || !drawn) {
    const why = String(ran.stderr ?? "").trim().split("\n")[0] || "it says nothing";
    return `warn: se-lsp lsp exits with ${ran.exitCode} before it answers: ${why}`;
  }
  const codes = [...new Set(drawn.map((one) => String(one?.code ?? "")).filter(Boolean))];
  return codes.length
    ? `answers, and draws ${codes.join(", ")} on the probe note`
    : "answers, and draws no diagnostic on the probe note";
}

// The diagnostics of the first publish frame, or null where the server sends none. [[spec/design_output/lsp#the-doctor-probes-the-server]]
function diagnosticsIn(stdout) {
  for (const one of String(stdout ?? "").split(/Content-Length: \d+\r\n\r\n/)) {
    let said = null;
    try {
      said = JSON.parse(one);
    } catch {
      continue;
    }
    if (said?.method === "textDocument/publishDiagnostics")
      return Array.isArray(said.params?.diagnostics) ? said.params.diagnostics : [];
  }
  return null;
}
