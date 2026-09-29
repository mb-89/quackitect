// The index door: the catalog's values and its actions over /v1, at the port
// the index's standing file names. It answers nothing where no index stands.
// [[spec/design_output/extension#the-views-section]]

const { readFileSync } = require("node:fs");
const { join } = require("node:path");

// The file standingPath in src/index/door.go writes, held again here because this module loads as CommonJS. [[spec/design_output/model#surfaces]]
const STANDING = [".se", ".runtime", "index.json"];

// [[spec/design_output/extension#the-views-section]]
function indexDoor(root) {
  const base = () => {
    try {
      const port = JSON.parse(readFileSync(join(root, ...STANDING), "utf8"))?.v1;
      return port ? `http://127.0.0.1:${port}/v1` : "";
    } catch {
      return "";
    }
  };
  const asks = async (path, init) => {
    const at = base();
    if (!at) return undefined;
    try {
      const said = await fetch(`${at}${path}`, init);
      return said.ok ? await said.json() : undefined;
    } catch {
      return undefined;
    }
  };
  return {
    values: async (name) => (await asks(`/values/${name}`))?.value,
    calls: (name, input) =>
      asks(`/actions/${name}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input ?? {}),
      }),
  };
}

module.exports = { indexDoor };
