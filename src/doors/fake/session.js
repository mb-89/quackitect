// Session records in memory, with exclusive handover claims.
// [[spec/design_output/copilot#state-between-processes]]

export function fakeSession(root) {
  const records = new Map();
  const claims = new Map();
  return {
    records,
    path(name) {
      if (name.includes("..")) throw new Error("Path outside this tree.");
      return name.startsWith(`${root}/`) ? name : `${root}/${name}`;
    },
    async withState(id, use) {
      if (!id) throw new Error("Missing session ID.");
      const state = structuredClone(records.get(id) ?? {});
      const save = () => records.set(id, structuredClone(state));
      const claim = (name) => {
        if (claims.has(name) && claims.get(name) !== id)
          throw new Error("Another session owns this handover.");
        claims.set(name, id);
      };
      const result = await use(state, save, claim, (name) => {
        if (claims.get(name) === id) claims.delete(name);
      });
      save();
      return result;
    },
  };
}
