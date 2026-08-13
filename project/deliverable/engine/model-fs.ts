import { fileDelete, fileGlob, fileList, filePatch, fileRead, fileReplace, fileWrite, type PatchOp } from "./files.ts";
import { fileMove } from "./move.ts";
import { search } from "./search.ts";
import { emitModelMutations } from "./signals.ts";
import { reconcileWarmVault, updateWarmVault, type VaultChange } from "./vault.ts";

export type { ModelMutationBatch, ModelMutationListener } from "./signals.ts";
export { subscribeModelMutations } from "./signals.ts";

function publish(batch: { root: string; changes: VaultChange[] }): void {
  updateWarmVault(batch.root, batch.changes);
  emitModelMutations({ ...batch, origin: "lane" });
}

export class ModelFileSystem {
  private readonly rootOf: (rel?: string) => string;

  constructor(rootOf: (rel?: string) => string) {
    this.rootOf = rootOf;
  }

  read(path: string, opts: Parameters<typeof fileRead>[2] = {}) {
    return fileRead(this.rootOf(path), path, opts);
  }

  /** A trace node minted in a bound record carries its record id, so the
   *  reference views can default to the iteration's own delta. The id is
   *  the worktree's own name — the root the write resolves into. */
  private static stamp(root: string, path: string, content: string): string {
    if (!/^project\/spec\/trace\/[^/]+\/[^/]+\.md$/.test(path.replace(/\\/g, "/"))) return content;
    const m = root.replace(/\\/g, "/").match(/\/\.worktrees\/([^/]+)\/?$/);
    if (m === null) return content;
    if (!content.startsWith("---\n") || /^minted_in:/m.test(content)) return content;
    return content.replace(/^---\n/, `---\nminted_in: ${m[1]}\n`);
  }

  write(path: string, content: string, baseHash: string | null) {
    const root = this.rootOf(path);
    const stamped = baseHash === null ? ModelFileSystem.stamp(root, path, content) : content;
    const result = fileWrite(root, path, stamped, baseHash);
    publish({ root, changes: [{ kind: "refresh", path: result.path }] });
    return result;
  }

  patch(ops: PatchOp[]) {
    const root = this.rootOf(ops[0]?.path);
    const result = filePatch(root, ops);
    publish({ root, changes: result.applied.map(({ path }) => ({ kind: "refresh", path })) });
    return result;
  }

  replace(glob: string, pattern: string, replacement: string, opts: Parameters<typeof fileReplace>[4] = {}) {
    const root = this.rootOf(glob);
    const result = fileReplace(root, glob, pattern, replacement, opts);
    publish({ root, changes: result.changed.map(({ path }) => ({ kind: "refresh", path })) });
    return result;
  }

  move(from: string, to: string) {
    const root = this.rootOf(from);
    const result = fileMove(root, from, to);
    publish({
      root,
      changes: [
        { kind: "rename", from: result.moved.from, to: result.moved.to },
        ...result.rewritten.map(({ path }): VaultChange => ({ kind: "refresh", path })),
      ],
    });
    return result;
  }

  delete(path: string, baseHash: string) {
    const root = this.rootOf(path);
    const result = fileDelete(root, path, baseHash);
    publish({ root, changes: [{ kind: "forget", path: result.deleted }] });
    return result;
  }

  list(dir: string) {
    return fileList(this.rootOf(dir), dir);
  }

  glob(glob: string, opts: Parameters<typeof fileGlob>[2] = {}) {
    return fileGlob(this.rootOf(glob), glob, opts);
  }

  search(query: string, opts: Parameters<typeof search>[2] = {}) {
    return search(this.rootOf(opts.path), query, opts);
  }

  reconcile(rel?: string): number {
    return reconcileWarmVault(this.rootOf(rel));
  }
}
