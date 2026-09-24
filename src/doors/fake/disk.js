// A filesystem in memory. It behaves: what a test writes, it reads back.
// [[spec/design_output/doors#a-fake-behaves]]

import { behaves } from "./behaves.js";

const HOPS = 8;

export function fakeDisk(seed = {}) {
  const files = new PathMap(Object.entries(seed));
  const folders = new Set();
  const links = new Map();
  const runs = new Set();
  // The fake's clock ticks once a write, so a later write reads as newer. [[spec/guidance/retro/collect]]
  const times = new PathMap();
  let tick = 0;
  let made = 0;

  // [[spec/design_output/extension#a-link-pointing-nowhere]]
  function exists(at, hops = 0) {
    if (links.has(at)) return hops < HOPS && exists(links.get(at), hops + 1);
    if (files.has(at) || folders.has(at)) return true;
    return [...files.keys(), ...folders].some((one) => one.startsWith(`${at}/`));
  }

  return behaves(
    {
      files,
      times,
      link(target, path) {
        if (files.has(norm(path)) || folders.has(norm(path)) || links.has(norm(path))) {
          const err = new Error(`file already exists: ${path}`);
          err.code = "EEXIST";
          throw err;
        }
        links.set(norm(path), norm(target));
      },
      isLink: (path) => links.has(norm(path)),
      realOf: (path) => links.get(norm(path)) ?? norm(path),
      runs,
      runnable: (path) => void runs.add(norm(path)),
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
      write(path, text) {
        files.set(norm(path), String(text));
        times.set(norm(path), ++tick);
      },
      // [[spec/design_output/doors#a-fake-behaves]]
      copy(from, to) {
        files.set(norm(to), this.read(from));
      },
      // A path lands where every folder above it passes `keeps`, the way the real walk prunes a folder it refuses. [[spec/tickets/disk-door-copies-a-folder]]
      copyFolder(from, to, keeps = () => true) {
        const was = norm(from);
        const now = norm(to);
        const passes = (rel) =>
          rel
            .split("/")
            .every((_, at, parts) => keeps(parts.slice(0, at + 1).join("/")));
        let count = 0;
        folders.add(now);
        for (const key of [...folders]) {
          if (!key.startsWith(`${was}/`)) continue;
          const rel = key.slice(was.length + 1);
          if (passes(rel)) folders.add(`${now}/${rel}`);
        }
        for (const key of [...files.keys()]) {
          if (!key.startsWith(`${was}/`)) continue;
          const rel = key.slice(was.length + 1);
          if (!passes(rel)) continue;
          files.set(`${now}/${rel}`, files.get(key));
          times.set(`${now}/${rel}`, ++tick);
          if (runs.has(key)) runs.add(`${now}/${rel}`);
          count++;
        }
        return count;
      },
      // The fake counts bytes, the way the real door does, so an offset means one thing on both. [[spec/design_output/log#a-reader-reads-new-rows]]
      size(path) {
        return Buffer.byteLength(String(this.read(path)));
      },
      readFrom(path, at) {
        const bytes = Buffer.from(String(this.read(path)));
        return bytes
          .subarray(Math.min(Math.max(0, Number(at) || 0), bytes.length))
          .toString("utf8");
      },
      modified(path) {
        this.read(path);
        return times.get(norm(path)) ?? 0;
      },
      move(from, to) {
        const was = norm(from);
        const now = norm(to);
        if (!exists(was)) {
          const err = new Error(`no such file: ${from}`);
          err.code = "ENOENT";
          throw err;
        }
        for (const key of [...files.keys()]) {
          if (key !== was && !key.startsWith(`${was}/`)) continue;
          files.set(`${now}${key.slice(was.length)}`, files.get(key));
          times.set(`${now}${key.slice(was.length)}`, times.get(key) ?? 0);
          files.delete(key);
        }
        for (const key of [...folders]) {
          if (key !== was && !key.startsWith(`${was}/`)) continue;
          folders.add(`${now}${key.slice(was.length)}`);
          folders.delete(key);
        }
      },
      append(path, text) {
        files.set(norm(path), `${files.get(norm(path)) ?? ""}${text}`);
        times.set(norm(path), ++tick);
      },
      exists: (path) => exists(norm(path)),
      remove(path) {
        const at = norm(path);
        if (links.delete(at)) return;
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
        // A list of a file is a fault on the real disk, so the fake throws the same code. [[spec/design_output/doors#a-fake-behaves]]
        if (files.has(at)) {
          throw Object.assign(new Error(`not a folder: ${path}`), { code: "ENOTDIR" });
        }
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
    },
    "disk",
  );
}

// The maps a test reads key every path through norm, so a Windows path and a posix one find the same row. [[spec/design_output/doors#a-fake-behaves]]
class PathMap extends Map {
  get(at) {
    return super.get(norm(at));
  }
  has(at) {
    return super.has(norm(at));
  }
  set(at, said) {
    return super.set(norm(at), said);
  }
  delete(at) {
    return super.delete(norm(at));
  }
}

// The key the fake files a path under, so a test reading its maps finds a Windows path too. [[spec/design_output/doors#a-fake-behaves]]
export function norm(path) {
  const said = String(path).split("\\").join("/");
  return said.replace(/^\.\//, "").replace(/\/+$/, "");
}
