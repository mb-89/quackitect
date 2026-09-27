// The front writer. The one place this tree reaches se-front, which writes
// every front of a note in one form.
// [[spec/tickets/go-writes-the-frontmatter]]

export function front() {
  return {
    set: (text) => text,
    drop: (text) => text,
    entry: (text) => text,
    after: (text) => text,
    mint: () => "",
  };
}
