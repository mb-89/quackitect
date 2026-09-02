// WHY NOTHING HAPPENED, IN WORDS, IN ONE PLACE.
//
// THE OWNER'S WORDS: I just tried it, and it does not seem to work, I do not see
// the token, it does not seem like if I entered work in the sidebar it enters
// the system.
//
// EVERY WAY THE MINT COULD FAIL WAS SILENT. The person typed the work, watched
// it vanish, and had no way to learn whether the engine refused it or nothing
// was sent. So the diagnosis was not which one fired, it was that nobody could
// tell. Now each one says which, and the cause names itself the next time.
//
// IT IS A MODULE OF ITS OWN BECAUSE IT HAS TO BE DRIVEN. extension.ts imports
// vscode, so nothing outside the editor can load it, and a check that cannot
// call the thing it is about can only read text. These are plain strings and a
// plain function, so util/checks/drive-panel.mjs drives every one of them.
//
// THE SET IS ASKED FOR RATHER THAN LISTED. Reasons is the members, and the check
// walks it, so a sixth added next month is covered without anybody editing the
// check.

export type Reason =
  | "nothing typed"
  | "no engine"
  | "no start"
  | "not json";

// Reasons is the set, in the order the chain meets them.
export const Reasons: Reason[] = ["nothing typed", "no engine", "no start", "not json"];

// whyNothingHappened answers what to show the person, naming which way it went.
//
// EVERY ANSWER NAMES ITS OWN CAUSE, because a message that says it did not work
// sends the person back to the same place they already were.
//
// SAID CARRIES WHAT THE OTHER SIDE ACTUALLY SAID, where there is one: the
// spawn's error, or the first line of whatever the engine printed instead of
// JSON. That line is the whole diagnosis for the case the owner hit, where the
// engine answered its usage because it had been sent a flag it has not got.
export function whyNothingHappened(why: Reason, said = ""): string {
  const tail = said.trim() ? " It said: " + firstLine(said.trim()) : "";
  switch (why) {
    case "nothing typed":
      return "Nothing was sent, because the line was empty. Type what the work is, " +
        "and put the detail after a slash.";
    case "no engine":
      return "Nothing was sent, because there is no folder open or no engine in .bin. " +
        "Nothing was minted.";
    case "no start":
      return "The engine would not start, so nothing was minted." + tail;
    case "not json":
      return "The engine answered something that is not JSON, so it did not read the call " +
        "and nothing was minted." + tail;
  }
}

function firstLine(said: string): string {
  const at = said.indexOf("\n");
  return at < 0 ? said : said.slice(0, at);
}
