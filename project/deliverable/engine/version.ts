// THE VERSION IS ONE FACT, read from the package manifest.
//
// It was hardcoded as "3.0.0-bootstrap" in FOUR places — the call log's stamp,
// the startup banner, the MCP server's advertised version, and the websearch
// hook's log entry. None of them followed the 4.0.0 release, so every call
// logged across the whole of v4 carried a version the product had already left
// behind.
//
// A STAMP NOBODY MAINTAINS IS WORSE THAN NO STAMP. It reads as provenance and
// it is false, which is exactly what vp-the-ledger is for. Found at
// gate-release on 2026-08-14, when the packaged engine announced 3.0.0-bootstrap
// out of a 4.1.0 archive.
//
// ONE READ, ONCE PER PROCESS, at import. That is why files.test.ts's ceiling
// carries it rather than the reader being routed through readNode: there is no
// node here, only the manifest the packaging script already reads.
import { readFileSync } from "node:fs";

/** The product's version, or "unknown" when the manifest cannot be read.
 *
 *  UNREADABLE ANSWERS "unknown" RATHER THAN THROWING. A version stamp must
 *  never be the reason a lane fails to start. */
export const SE_VERSION: string = (() => {
  try {
    const raw = readFileSync(new URL("../package.json", import.meta.url), "utf8");
    const v = (JSON.parse(raw) as { version?: unknown }).version;
    return typeof v === "string" && v !== "" ? v : "unknown";
  } catch {
    return "unknown";
  }
})();
