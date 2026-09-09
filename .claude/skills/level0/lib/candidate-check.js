// Biome reports diagnostics for files, while its stdin path returns source.
// [[spec/design_output/copilot#one-runtime]]

export function candidateRun(it, run) {
  return (argv, init) => {
    if (argv[1] !== "lint") return run(argv, init);
    const folder = it.disk.tempDir("quack-check-");
    try {
      const where = argv.find((one) => one.startsWith("--stdin-file-path="));
      const name = where.slice("--stdin-file-path=".length).split(/[\\/]/).at(-1);
      const path = it.join(folder, name);
      const config = JSON.parse(
        it.disk.read(it.join(it.root, "spec/config/biome.json")),
      );
      config.files = { ...config.files, includes: ["**"] };
      config.vcs = { ...config.vcs, enabled: false };
      it.disk.write(it.join(folder, "biome.json"), JSON.stringify(config));
      it.disk.write(path, init.stdin);
      return run(
        [
          argv[0],
          "lint",
          `--config-path=${folder}`,
          "--reporter=json",
          "--max-diagnostics=none",
          path,
        ],
        { cwd: folder },
      );
    } finally {
      it.disk.remove(folder);
    }
  };
}
