// The host of the drawing over a ticket: which page draws it, which side it
// shows, and what the page hears. The editor hands the page, the fold and the
// theme through the door, so a test drives the whole of it with no editor.
// [[spec/tickets/the-inset-folds-the-frontmatter]]

const FLIP = "quackitect.route.flip";

// [[spec/tickets/the-inset-folds-the-frontmatter]]
function routeHostOf(door) {
  return {
    watches: [],
    async opened(path, text) {},
    async changed(path, text) {},
    themed() {},
    flipped(path) {},
    lenses(path) {
      return [];
    },
  };
}

module.exports = { FLIP, routeHostOf };
