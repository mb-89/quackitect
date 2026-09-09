// Plugin validation remains optional on machines without Claude.
// [[spec/design_output/copilot#setup-and-discovery]]

export function validatePlugin(run, path, root) {
  try {
    return run(["claude", "plugin", "validate", path], { cwd: root });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return { exitCode: 1, stdout: "", stderr: "" };
  }
}
