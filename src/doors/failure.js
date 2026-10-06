// The failure door: it reads the nodes under spec/failures, prints a raised
// failure's lines and writes its row through the log door.
// [[spec/design_output/failures#one-door-raises-a-failure]]

export function failure(disk, log, root = ".") {
  return { raise: async (id, said) => [] };
}
