// Content hashing for the CAS lane. Short sha256 prefix — collision space is
// per-file and per-edit-window, 12 hex chars is plenty and stays readable.
import { createHash } from "node:crypto";

export function contentHash(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex").slice(0, 12);
}
