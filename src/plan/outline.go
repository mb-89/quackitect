// The queue as an outline, ported from src/scripts/pull-outline.js. A row at
// the left takes one number, a ticket under it a sub-number, and a person's row
// a negative number that sorts first.
// [[spec/tickets/the-queue-moves-to-plan]]
package plan

// The words a todo carries in place of a row's name, and the place of a row a cloud branch holds. [[spec/design_output/pull#the-queue-is-an-outline]]
const (
	First      = "first"
	Last       = "last"
	End        = "end"
	CloudPlace = "∞"
)

// [[spec/tickets/the-queue-moves-to-plan]]
func Outline(persons, held, rest, all []Row, places map[string]string) map[string]string {
	return map[string]string{}
}

// [[spec/tickets/the-queue-moves-to-plan]]
func Compare(left, right string) int {
	return 0
}
