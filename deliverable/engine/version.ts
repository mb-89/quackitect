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

/** THE VERSION ON DISK, read fresh every time.
 *
 *  SE_VERSION above is evaluated once at import and frozen for the life of the
 *  process — which is correct for a stamp and is exactly what makes the lane
 *  unable to notice its own age. This reads the manifest again, so the two can
 *  be compared.
 *
 *  see dsp-boot-and-power.md#the-version-is-one-fact */
export function versionOnDisk(): string {
  try {
    const raw = readFileSync(new URL("../package.json", import.meta.url), "utf8");
    const v = (JSON.parse(raw) as { version?: unknown }).version;
    return typeof v === "string" && v !== "" ? v : "unknown";
  } catch {
    return "unknown";
  }
}

/** WHETHER THE RUNNING LANE IS THE CODE ON DISK, as far as the version can say.
 *
 *  A DIFFERENT VERSION PROVES STALENESS. The same version proves nothing — an
 *  engine edit that does not touch the manifest is invisible here, and most do
 *  not. This is a smoke alarm, not an inventory. */
export function laneAge(): { stale: boolean; served: string; on_disk: string } {
  const on_disk = versionOnDisk();
  return { stale: on_disk !== "unknown" && on_disk !== SE_VERSION, served: SE_VERSION, on_disk };
}
