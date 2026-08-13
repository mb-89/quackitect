// THE MODEL'S MUTATION SIGNAL — one place fires, any number of slots listen.
//
// It lives apart from the model and the vault because BOTH raise it: the lane
// when it writes, the watcher when somebody else does. A registry inside
// either one would make the other import it in a circle.
//
// FIRING DOES NOT WAIT. A slot that needs to do real work schedules it.
import type { VaultChange } from "./vault.ts";

export interface ModelMutationBatch {
  root: string;
  changes: VaultChange[];
  /** lane — a write the model made. external — a write it only observed. */
  origin: "lane" | "external";
}

export type ModelMutationListener = (batch: ModelMutationBatch) => void;

const listeners = new Map<string, Set<ModelMutationListener>>();

export function subscribeModelMutations(root: string, listener: ModelMutationListener): () => void {
  let group = listeners.get(root);
  if (group === undefined) {
    group = new Set();
    listeners.set(root, group);
  }
  group.add(listener);
  return () => {
    group?.delete(listener);
    if (group?.size === 0) listeners.delete(root);
  };
}

export function emitModelMutations(batch: ModelMutationBatch): void {
  for (const listener of listeners.get(batch.root) ?? []) listener(batch);
}
