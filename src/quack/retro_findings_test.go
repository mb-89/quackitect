// A findings file read a section per row, whatever line ending its editor
// writes.
// [[spec/guidance/retro/read]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"reflect"
	"testing"
)

// A findings file reads a section per row, and a missing section reads nil. [[spec/guidance/retro/read]]
func TestRetroFindingsReadASectionPerRowAndAMissingSectionReadsNil(t *testing.T) {
	t.Parallel()
	read := retroFindingsOf("## stop\n\n- the panel waits for a file\n\n## keep\n")
	if !reflect.DeepEqual(read["stop"], []string{"the panel waits for a file"}) {
		t.Fatalf("stop reads %q", read["stop"])
	}
	if read["keep"] == nil || len(read["keep"]) != 0 {
		t.Fatalf("keep reads %#v, want an empty row", read["keep"])
	}
	if read["more"] != nil {
		t.Fatalf("more reads %#v, want nil", read["more"])
	}
}

// A file a Windows editor writes ends each line on a carriage return too. [[spec/guidance/retro/read]]
func TestRetroFindingsWithCarriageReturnsReadTheSameItems(t *testing.T) {
	t.Parallel()
	read := retroFindingsOf("## stop\r\n\r\n- the panel waits for a file\r\n\r\n## keep\r\n")
	if !reflect.DeepEqual(read["stop"], []string{"the panel waits for a file"}) {
		t.Fatalf("stop reads %q", read["stop"])
	}
	if read["keep"] == nil || len(read["keep"]) != 0 {
		t.Fatalf("keep reads %#v, want an empty row", read["keep"])
	}
}
