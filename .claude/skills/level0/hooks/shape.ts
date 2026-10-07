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
