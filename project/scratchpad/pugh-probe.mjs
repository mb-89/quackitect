// One-shot probe: does i1's converge-pugh form carry the computed matrix?
import { Session } from "../deliverable/engine/session.ts";

const s = new Session(process.cwd());
const m = s.formMachine("i1");
const model = s.stateFormGet("converge-pugh", m);
const sens = s.stateFormGet("reverse-sensitivity", m)?.field_args?.sensitivity?.sensitivity;
console.log(
  JSON.stringify({
    sens_present: sens !== null && sens !== undefined,
    sens_winner: sens?.winner,
    rivals: sens?.rivals?.map((r) => ({ id: r.id, deficit: r.deficit, swings: r.swings.length })),
  }),
);
const args = model?.field_args?.matrix_runs;
const mv = args?.matrix;
const decl = m.states.find((x) => x.id === "converge-pugh" || x.id.endsWith("/converge-pugh"));
console.log(
  JSON.stringify(
    {
      model_keys: Object.keys(model ?? {}),
      evidence_decl: decl?.evidence_form,
      matrix_present: mv !== null && mv !== undefined,
      winner: mv?.winner,
      stable: mv?.stable,
      axes: mv?.axes?.length,
      runs: mv?.runs?.length,
      problems: mv?.problems,
    },
    null,
    1,
  ),
);
