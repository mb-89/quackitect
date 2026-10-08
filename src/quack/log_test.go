// quack log reads the session log's rows off the log module.
// [[spec/tickets/the-log-topic-lands]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"testing"
)

// The log verb takes an array alone, so a log holding no row answers an empty one. [[spec/tickets/log-shadow-reads-unfiltered-rows]]
func TestLogAnswersAnEmptyArrayForNoRow(t *testing.T) {
	t.Parallel()
	said, err := json.Marshal(logRows(""))
	if err != nil || string(said) != "[]" {
		t.Fatalf("no row reads %s, %v, and wants []", said, err)
	}
}
