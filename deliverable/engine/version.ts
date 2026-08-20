// see dsp-boot-and-power.md#the-version-is-one-fact
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
