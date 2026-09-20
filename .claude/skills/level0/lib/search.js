// The find tool's spec. It stands under the skill folder so the plugin names
// the tool at session start, with no server standing.
// [[spec/design_output/level0#the-bridgehead-starts-it-too]]

export const FIND = "find";

export function findSpec() {
  return {
    name: FIND,
    description:
      "Finds the lines in this tree carrying the words, ranked by the index. Ask it before a Grep over the tree, because it reads the rows and not the disk.",
    inputSchema: {
      type: "object",
      properties: { words: { type: "string", description: "The words to look for." } },
      required: ["words"],
    },
  };
}
