// A vehicle's hooks module, small: it registers one hook a door the bridgehead
// forwards, and writes what reaches it through the hand it gets.
// [[spec/design_output/level0#a-bridgehead-imports-a-copy]]

export function register(on, options) {
  on("session.start", async ($, e, next) => {
    await $.fs.write("seen", `start ${options?.brand ?? ""}`);
    return next(e);
  });
  on("tool.call", { tool: "Bash" }, async (_$, e, _next) => ({
    deny: `no ${e.command}`,
  }));
  on("tool.call", async ($, e, next) => {
    await $.fs.write("seen", `call ${e.tool}`);
    return next({ ...e, seen: true });
  });
  on("turn.complete", async ($, e, next) => {
    const said = await next(e);
    await $.fs.write("seen", `end ${e.reason}`);
    return said;
  });
  on("turn.step", async function* ($, e, next) {
    const said = yield* next(e);
    await $.fs.write("seen", `step ${e.index}`);
    return said;
  });
}
