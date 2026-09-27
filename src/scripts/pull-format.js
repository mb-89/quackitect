// The formatter a payload meets before the engine merges it: text in, text
// out, so the pull stays cold and reads no Vale.
// [[spec/design_output/pull#the-fields-ride-the-payload]]

// [[spec/design_output/pull#the-fields-ride-the-payload]]
export function formatted(said) {
  return String(said ?? "");
}
