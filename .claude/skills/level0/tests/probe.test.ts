import { expect, test } from "claude-code/testing";
import settings from "../../../settings.json" with { type: "json" };

test("the settings read", () => {
  expect(settings.hooks.SessionStart[0].hooks[0].timeout).toBe(180);
});

test("a down door's cage verb denies a guarded call", async ($, on) => {
  const runs: string[][] = [];
  on("fs.read", async () => ({ deny: "ENOENT: no such file" }));
  on("process.run", async (_$, e) => {
    runs.push([...e.argv]);
    const cage = e.argv.includes("cage");
    return { value: { exitCode: 0, stdout: cage ? '{"deny":"no"}' : "", stderr: "" } as never };
  });
  on("http.fetch", async () => ({ deny: "refused" }));
  on("ui.log", async () => ({ value: undefined }));
  on("tool.call", async () => ({ value: { result: "ran" } as never }));
  const said = await $.tool.call({ tool: "Bash", input: { command: "ls" } } as never);
  console.log(JSON.stringify(said), JSON.stringify(runs));
  expect(JSON.stringify(said)).toContain("no");
});
