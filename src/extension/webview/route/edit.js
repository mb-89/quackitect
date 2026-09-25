// An edit to the route, worked on the steps the host hands the page. Each
// answers the whole route `ticket route` takes, or null where the edit touches
// a step the ticket reached. It reads no page, so a test in node drives it.
// [[spec/design_output/drawing#the-page-takes-an-edit]]

// The list holding a step, and the step's place in it, off its path. [[spec/design_output/drawing#the-page-takes-an-edit]]
function placeOf(steps, path) {
  const names = String(path ?? "").split("/");
  let list = steps;
  for (const [at, name] of names.entries()) {
    const i = (list ?? []).findIndex((one) => String(one?.name ?? "") === name);
    if (i < 0) return null;
    if (at === names.length - 1) return { list, i };
    list = list[i].steps;
  }
  return null;
}

// A copy the edit writes into, so the host's route stands as it came. [[spec/design_output/drawing#the-page-takes-an-edit]]
function copyOf(steps) {
  return JSON.parse(JSON.stringify(steps ?? []));
}

// A step's path beside its siblings. [[spec/design_output/drawing#the-page-takes-an-edit]]
function pathBeside(path, name) {
  const cut = String(path).lastIndexOf("/");
  return cut < 0 ? name : `${path.slice(0, cut)}/${name}`;
}

// The route with the step one place up or down among its siblings, where neither step stands reached. [[spec/design_output/drawing#the-page-takes-an-edit]]
export function moved(steps, path, by, reached) {
  if (reached.has(path)) return null;
  const out = copyOf(steps);
  const at = placeOf(out, path);
  const to = at ? at.i + by : -1;
  if (!at || to < 0 || to >= at.list.length) return null;
  if (reached.has(pathBeside(path, String(at.list[to]?.name ?? "")))) return null;
  [at.list[at.i], at.list[to]] = [at.list[to], at.list[at.i]];
  return out;
}

// The route without the step, where it stands unreached. [[spec/design_output/drawing#the-page-takes-an-edit]]
export function dropped(steps, path, reached) {
  if (reached.has(path)) return null;
  const out = copyOf(steps);
  const at = placeOf(out, path);
  if (!at) return null;
  at.list.splice(at.i, 1);
  return out;
}

// The ids the graph marks reached. [[spec/design_output/drawing#the-page-takes-an-edit]]
export function reachedIn(graph) {
  return new Set(
    (graph?.nodes ?? []).filter((one) => one.reached).map((one) => one.id),
  );
}
