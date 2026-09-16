// What the battery says about one commit. The check stamps the commit it runs
// against, and `branch done` reads that stamp, where it once read a claim.
// [[spec/design_output/work#the-battery-answers-first]]

export const STAMP = ".se/check.json";
const SHORT_SHA = 8;

export function shortOf(sha) {
  return String(sha ?? "").slice(0, SHORT_SHA);
}

export function stampOf(text) {
  try {
    const read = JSON.parse(text || "{}");
    return {
      sha: String(read.sha ?? ""),
      ok: read.ok === true,
      clean: read.clean === true,
      at: String(read.at ?? ""),
    };
  } catch {
    return { sha: "", ok: false, clean: false, at: "" };
  }
}

export function saysGreen(stamp, sha) {
  if (!stamp.sha) return { green: false, says: "no check has run here" };
  if (stamp.sha !== sha) {
    return { green: false, says: `the check ran against ${shortOf(stamp.sha)}` };
  }
  if (!stamp.clean) return { green: false, says: "the check ran over an unclean tree" };
  if (!stamp.ok) return { green: false, says: `the check answered red at ${stamp.at}` };
  return { green: true, says: `the check passes on ${shortOf(sha)}` };
}
