// Whether this session runs on a cloud box, where nobody sits beside it. Every
// door reading that fact reads it here, so one name says what a cloud box is.
// [[spec/guidance/cloud]]

export const CLOUD = ["CLAUDE_CODE_REMOTE", "SE_CLOUD"];

// [[spec/guidance/cloud]]
export function inCloud(env = {}) {
  return CLOUD.some((name) => truthy(env?.[name]));
}

function truthy(said) {
  const held = String(said ?? "")
    .trim()
    .toLowerCase();
  return Boolean(held) && held !== "0" && held !== "false";
}
