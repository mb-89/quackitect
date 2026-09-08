// A filesystem in memory. It behaves: what a test writes, it reads back.
// [[spec/design_output/doors#a-fake-behaves]]

export function fakeDisk(seed = {}) {
  const files = new Map(Object.entries(seed));
  const folders = new Set();
  let made = 0;

  return {
    files,
    tempDir(prefix = "tmp") {
      made++;
      const at = `/tmp/${prefix}${made}`;
      folders.add(at);
      return at;
    },
    read(path) {
      const said = files.get(norm(path));
      if (said === undefined) {
        const err = new Error(`no such file: ${path}`);
        err.code = "ENOENT";
        throw err;
      }
      return said;
    },
    write: (path, text) => void files.set(norm(path), String(text)),
    exists: (path) => files.has(norm(path)),
    remove(path) {
      const at = norm(path);
      for (const key of [...files.keys()]) {
        if (key === at || key.startsWith(`${at}/`)) files.delete(key);
      }
      for (const key of [...folders]) {
        if (key === at || key.startsWith(`${at}/`)) folders.delete(key);
      }
    },
    makeDir: (path) => void folders.add(norm(path)),
    list(path) {
      const at = norm(path);
      const seen = new Map();
      for (const key of folders) {
        if (!key.startsWith(`${at}/`)) continue;
        const rest = key.slice(at.length + 1);
        const cut = rest.indexOf("/");
        seen.set(cut === -1 ? rest : rest.slice(0, cut), "dir");
      }
      for (const key of files.keys()) {
        if (!key.startsWith(`${at}/`)) continue;
        const rest = key.slice(at.length + 1);
        const cut = rest.indexOf("/");
        if (cut === -1) seen.set(rest, "file");
        else seen.set(rest.slice(0, cut), "dir");
      }
      if (!seen.size && !folders.has(at) && !files.has(at)) {
        throw new Error(`no such folder: ${path}`);
      }
      return [...seen].map(([name, kind]) => ({ name, kind }));
    },
  };
}

function norm(path) {
  const said = String(path).split("\\").join("/");
  return said.replace(/^\.\//, "").replace(/\/+$/, "");
}
