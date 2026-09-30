// THE TRANSCRIPT READS. What the bridgehead reads off the session's own rows: the agent's last texts, the rows the answer door keys on, and a stream chunk's text. [[spec/tickets/a-reply-follows-its-prompt]]

// The agent's texts the answer door reads, and the transcript rows it reads past the prompt's own row. [[spec/tickets/a-reply-follows-its-prompt]]
const TEXTS = 4;
const ROWS = 64;

export async function lastTexts($) {
  const out = [];
  let rows = [];
  try {
    rows = await $.session.messages();
    for (let at = rows.length - 1; at >= 0 && out.length < TEXTS; at--) {
      const said = String(rows[at]?.text ?? "").trim();
      if (rows[at]?.role === "assistant" && said) out.unshift(said);
    }
  } catch {}
  return {
    texts: out,
    rows: (Array.isArray(rows) ? rows : []).slice(-ROWS).map(rowOf),
  };
}

// A row as the answer door reads it: its role, its id where it carries one, and its text where the agent wrote it. [[spec/tickets/a-reply-follows-its-prompt]]
export function rowOf(row) {
  const id = row?.id ?? row?.uuid;
  return {
    role: String(row?.role ?? ""),
    ...(id ? { id: String(id) } : {}),
    ...((row?.toolResults ?? []).length ? { results: true } : {}),
    ...(row?.role === "assistant" ? { text: String(row?.text ?? "").trim() } : {}),
  };
}

// The prompt carries the id of the newest transcript row, so the answer door keys on it. [[spec/tickets/a-reply-follows-its-prompt]]
export async function beforeOf($, event, e) {
  if (event !== "prompt.submit" || !e || typeof e !== "object") return e;
  try {
    const rows = await $.session.messages();
    const id = rows.at(-1)?.id ?? rows.at(-1)?.uuid;
    return id ? { ...e, before: String(id) } : e;
  } catch {
    return e;
  }
}

export function textOf(chunk) {
  if (!chunk || typeof chunk !== "object" || chunk.kind !== "text") return "";
  return typeof chunk.text === "string" ? chunk.text : "";
}
