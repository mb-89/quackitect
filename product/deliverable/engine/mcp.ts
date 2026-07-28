// The MCP lane (pillar 2) — hand-rolled stdio transport.
//
// DECIDED AT B2 (decision-timing principle, with implementation data):
// hand-rolled over @modelcontextprotocol/sdk. Grounds: the needed subset
// (stdio line-delimited JSON-RPC; initialize, tools/list, tools/call, ping)
// is thin; the engine is zero-runtime-deps and the SDK brings zod plus
// transitive churn; the toll and refusal-first behaviors need custom
// dispatch middleware anyway. Risk (protocol drift) is carried by contract
// tests that speak real bytes to a spawned server.
//
// Wire names use underscores (se_get_node): the Anthropic API rejects dots
// in tool names, so dotted names live in titles/descriptions only.
import { createInterface } from "node:readline";
import { Rejection } from "./errors.ts";

export interface ToolDef {
  /** Wire name, [a-zA-Z0-9_-] only. */
  name: string;
  /** Human/display name — the dotted form, e.g. "se.get.node". */
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => unknown | Promise<unknown>;
}

/** Dispatch middleware — may throw a Rejection to refuse the call (the toll). */
export type DispatchGuard = (toolName: string, args: Record<string, unknown>) => void;

/** Success-path hook — may enrich a result (the toll's grace warning rides here). */
export type ResultDecorator = (toolName: string, result: unknown) => unknown;

/** Post-dispatch observer — the single call path's log hook (§9: log
 *  everything raw; derive at read time). Never throws into dispatch. */
export type CallObserver = (record: {
  tool: string;
  args: Record<string, unknown>;
  ok: boolean;
  duration_ms: number;
  outcome: "result" | "rejected" | "errored";
  /** Rejection/error payload — the response direction of the call feed. */
  response?: unknown;
}) => void;

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: number | string | null;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: number | string | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export const PROTOCOL_VERSION = "2025-06-18";

export class McpServer {
  private tools = new Map<string, ToolDef>();
  private guards: DispatchGuard[] = [];
  private decorators: ResultDecorator[] = [];
  private observers: CallObserver[] = [];
  readonly serverInfo: { name: string; version: string };

  constructor(serverInfo: { name: string; version: string }, tools: ToolDef[] = []) {
    this.serverInfo = serverInfo;
    for (const t of tools) this.register(t);
  }

  addGuard(guard: DispatchGuard): void {
    this.guards.push(guard);
  }

  addDecorator(decorator: ResultDecorator): void {
    this.decorators.push(decorator);
  }

  addObserver(observer: CallObserver): void {
    this.observers.push(observer);
  }

  private observe(record: Parameters<CallObserver>[0]): void {
    for (const o of this.observers) {
      try {
        o(record);
      } catch {
        // The log hook must never break dispatch.
      }
    }
  }

  register(tool: ToolDef): void {
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(tool.name)) throw new Error(`illegal tool name: ${tool.name}`);
    if (this.tools.has(tool.name)) throw new Error(`duplicate tool: ${tool.name}`);
    this.tools.set(tool.name, tool);
  }

  toolNames(): string[] {
    return [...this.tools.keys()];
  }

  /** Handle one message. Returns null for notifications (no response). */
  async handle(msg: JsonRpcRequest): Promise<JsonRpcResponse | null> {
    if (msg.id === undefined || msg.id === null) return null; // notification
    const id = msg.id;
    try {
      switch (msg.method) {
        case "initialize":
          return this.ok(id, {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: { tools: {} },
            serverInfo: this.serverInfo,
          });
        case "ping":
          return this.ok(id, {});
        case "tools/list":
          return this.ok(id, {
            tools: [...this.tools.values()].map((t) => ({
              name: t.name,
              title: t.title,
              description: t.description,
              inputSchema: t.inputSchema,
            })),
          });
        case "tools/call": {
          const name = String(msg.params?.name ?? "");
          const tool = this.tools.get(name);
          if (!tool) return this.err(id, -32602, `unknown tool: ${name}`);
          const args = (msg.params?.arguments ?? {}) as Record<string, unknown>;
          const started = Date.now();
          try {
            for (const guard of this.guards) guard(name, args);
            let result = await tool.handler(args);
            for (const d of this.decorators) result = d(name, result);
            this.observe({ tool: name, args, ok: true, duration_ms: Date.now() - started, outcome: "result", response: result });
            return this.ok(id, {
              content: [{ type: "text", text: JSON.stringify(result, null, 1) }],
              isError: false,
            });
          } catch (e) {
            if (e instanceof Rejection) {
              // Rejections are results, not protocol errors: the model must
              // read clause + executable remedy and recover in one turn.
              this.observe({ tool: name, args, ok: false, duration_ms: Date.now() - started, outcome: "rejected", response: e.toJSON() });
              return this.ok(id, {
                content: [{ type: "text", text: JSON.stringify(e.toJSON(), null, 1) }],
                isError: true,
              });
            }
            this.observe({ tool: name, args, ok: false, duration_ms: Date.now() - started, outcome: "errored", response: String((e as Error).message) });
            return this.ok(id, {
              content: [{ type: "text", text: JSON.stringify({ kind: "errored", message: String((e as Error).message) }) }],
              isError: true,
            });
          }
        }
        default:
          return this.err(id, -32601, `method not found: ${msg.method}`);
      }
    } catch (e) {
      return this.err(id, -32603, `internal: ${String((e as Error).message)}`);
    }
  }

  private ok(id: number | string, result: unknown): JsonRpcResponse {
    return { jsonrpc: "2.0", id, result };
  }

  private err(id: number | string, code: number, message: string): JsonRpcResponse {
    return { jsonrpc: "2.0", id, error: { code, message } };
  }
}

/** stdio loop: one JSON message per line, UTF-8. onGone fires when the lane
 *  closes — the only notice the engine gets that the console quit. Without it
 *  the mirror can only infer death from silence, and the reader waits out a
 *  timeout for an answer the server already had. */
export function runStdio(server: McpServer, onGone?: () => void): void {
  const rl = createInterface({ input: process.stdin, terminal: false });
  rl.on("close", () => onGone?.());
  rl.on("line", (line) => {
    const trimmed = line.trim();
    if (trimmed === "") return;
    let msg: JsonRpcRequest;
    try {
      msg = JSON.parse(trimmed) as JsonRpcRequest;
    } catch {
      process.stdout.write(
        JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } }) + "\n",
      );
      return;
    }
    void server.handle(msg).then((res) => {
      if (res) process.stdout.write(JSON.stringify(res) + "\n");
    });
  });
}
