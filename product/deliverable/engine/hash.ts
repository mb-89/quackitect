// Content hashing (§8). Cryptographic because a collision would mean a
// silently missed suspect — exactly the failure class the ledger exists to
// prevent. Line endings are normalized to LF before hashing so the hash is
// a fact about content, not about the OS that wrote the bytes.
import { createHash } from "node:crypto";

export function sha256(content: string | Buffer): string {
  const normalized =
    typeof content === "string" ? content.replace(/\r\n/g, "\n") : content.toString("utf8").replace(/\r\n/g, "\n");
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}

/** Short form for display surfaces; full hash stays the identity. */
export function shortHash(hash: string): string {
  return hash.slice(0, 12);
}
