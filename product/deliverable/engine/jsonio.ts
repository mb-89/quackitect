// JSON reads tolerate a UTF-8 BOM: Windows tooling prepends one, and
// JSON.parse rejects it — one stray byte must not take a lane down.
import { readFileSync } from "node:fs";

export const stripBom = (s: string): string => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s);

export function readJsonFile<T>(path: string): T {
  return JSON.parse(stripBom(readFileSync(path, "utf8"))) as T;
}
