// The warnings a push carries. One list stands, and the lint answers it, so the
// panel, the refactoring hand and both push doors read one thing. Every
// function here takes rows and answers rows, so a test drives it over a fixture.
// [[spec/tickets/one-list-holds-the-warnings]]

export const WARNING = "warning";

// A push carries files, and the lint over those alone says what it adds. [[spec/tickets/one-list-holds-the-warnings]]
export function warningsOn(found, names) {
  const held = new Set([names ?? []].flat().filter(Boolean).map(String));
  return [found ?? []]
    .flat()
    .filter((one) => String(one?.severity ?? "") === WARNING)
    .filter((one) => held.has(String(one?.file ?? "")));
}

// [[spec/tickets/one-list-holds-the-warnings]]
export function filesOn(found) {
  return [...new Set([found ?? []].flat().map((one) => String(one?.file ?? "")))]
    .filter(Boolean)
    .sort();
}

// The list stands past the number where the count runs over it, and a number at zero switches the rule off. [[spec/tickets/the-spawn-reaches-its-guidance]]
export function standsPast(count, most) {
  return Number(most) > 0 && Number(count) > Number(most);
}

// The hand takes one file. A write inside the window holds its file back, and the oldest of the rest goes. Both spans read seconds, as `git log --format=%ct` answers them. [[spec/tickets/the-spawn-reaches-its-guidance]]
export function takesFile(files, wrote, now, window) {
  const at = (name) => Number(wrote?.[name] ?? 0);
  return (
    [files ?? []]
      .flat()
      .filter(Boolean)
      .filter((one) => at(one) > 0 && Number(now) - at(one) >= Number(window))
      .sort((a, b) => at(a) - at(b))[0] ?? ""
  );
}

// What the hand reads when it starts: one file, and the verbs that name what stands on it. [[spec/tickets/the-spawn-reaches-its-guidance]]
export function drains(file) {
  return [
    `Take ${file}, and drain the warnings the rules name on it.`,
    "",
    `Run \`./RUNME.sh lint ${file}\` to read them, and \`./RUNME.sh fix ${file}\` for what a program mends.`,
    "Mend the rest by hand. Leave every line the rules pass, and commit this one file.",
  ].join("\n");
}

// [[spec/tickets/one-list-holds-the-warnings]]
export function refusedWarnings(found) {
  const files = filesOn(found);
  const rules = [...new Set(found.map((one) => String(one?.rule ?? "")))].filter(Boolean);
  return [
    "A file this push carries stands at warning, and nothing leaves the box while one stands.",
    "",
    ...files.map((one) => `  ${one}`),
    "",
    `The rules naming them: ${rules.sort().join(", ")}.`,
    "",
    "Run `./RUNME.sh lint <file>` to read each one, and `./RUNME.sh fix` for what",
    "a program mends. A warning outside these files holds no push.",
  ].join("\n");
}
