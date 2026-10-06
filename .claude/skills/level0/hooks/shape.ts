// THE SHAPES. The pure pieces the bridgehead shapes an answer and a row with, apart from it, since none of them reaches $. [[spec/design_output/level0#the-bridgehead-and-the-server]]

// A record read off JSON or an event, whose fields a hook narrows where it reads them; the engine names no such shape.
export type Fields = Record<string, unknown>;
// An event as the bridgehead reads it off any door: some engine input, or nothing, whose tool input it reads a command off. [[spec/design_output/level0#the-bridgehead-and-the-server]]
export type Given = (Readonly<Fields> & { readonly input?: Readonly<Fields> }) | null | undefined;
// What a thrown value carries, read where it is an object. [[spec/design_output/level0#the-bridge-says-it-falls]]
export type Failure = {
  readonly status?: unknown;
  readonly message?: unknown;
  readonly code?: unknown;
};
// A spawn's answer as a hook reads it: the engine's AgentSpawnResult, and the text and flag a helper's answer carries besides. [[spec/tickets/the-spawn-reaches-its-guidance]]
export type Spawned = {
  readonly deny?: unknown;
  readonly text?: unknown;
  readonly isError?: unknown;
};

// A thrown value as an object whose fields a hook reads, or undefined where it is none. [[spec/design_output/level0#the-bridge-says-it-falls]]
export function failureOf(error: unknown): Failure | undefined {
  return error !== null && typeof error === "object" ? error : undefined;
}

// The append a row takes through a process, so a row another writer appends between a read and a write stays. [[spec/design_output/log#every-writer-appends]]
export const APPEND =
  "const fs = require('node:fs'); const path = require('node:path'); const [file, row] = process.argv.slice(1); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.appendFileSync(file, row);";

// An answer with an after merged in: a list grows, a text takes the new one below it, and anything else stands replaced. [[spec/design_output/schema#the-verbs-own-their-fields]]
export function merged(said: unknown, after: Readonly<Fields> | null | undefined): Fields {
  const out: Fields = said && typeof said === "object" ? { ...said } : {};
  for (const [key, value] of Object.entries(after ?? {})) {
    const was = out[key];
    if (Array.isArray(value) && Array.isArray(was))
      out[key] = [...was, ...value];
    else if (typeof value === "string" && typeof was === "string" && was)
      out[key] = `${was}\n\n${value}`;
    else out[key] = value;
  }
  return out;
}
