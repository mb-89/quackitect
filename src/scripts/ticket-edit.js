// The ticket verbs the work view's actions run: place, urgent and set, each
// writing what the work tab's own key writes.
// [[spec/tickets/view-actions-run-through-verbs]]

// The value a place writes for the row at n, by the rule PlaceValue in src/tui/work/workplace.go holds, or the notice saying why it writes none. [[spec/tickets/view-actions-run-through-verbs]]
export function placeValue(rows, name, n) {
  return { value: "", notice: "" };
}
