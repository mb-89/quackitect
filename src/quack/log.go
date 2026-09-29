// quack log: every row of the session log as the log module reads it, as
// JSON. The log verb reads it beside its own rows while the log slice runs in
// shadow.
// [[spec/tickets/the-log-topic-lands]]
package main

import logmodule "quackitect/src/modules/log"

// The rows the module reads off one session log's text. [[spec/tickets/the-log-topic-lands]]
func logRows(text string) []logmodule.Row {
	return nil
}
