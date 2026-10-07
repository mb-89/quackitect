// The session file read once, for the one frame: every whole line a record,
// a half line waiting, and nothing where no file stands.
// [[spec/design_output/tui#one-frame]]

package log

import (
	"testing"
	"testing/fstest"
)

func TestReadLogTakesEveryWholeLineAndLeavesAHalfOne(t *testing.T) {
	t.Parallel()
	body := `{"at":"2026-09-11T15:00:01Z","level":"info","kind":"prompt","said":"one"}` + "\n" +
		`{"level":"warn","kind":"tool","said":"two"}` + "\n" + `{"said":"half`
	disk := fstest.MapFS{"session.jsonl": {Data: []byte(body)}}
	recs, err := readLog(disk.ReadFile, "session.jsonl")
	if err != nil || len(recs) != 2 {
		t.Fatalf("the read answers %d rows and %v, and wants the two whole lines", len(recs), err)
	}
	if !recs[1].At.Equal(recs[0].At) || recs[1].Level != "warn" {
		t.Fatalf("a line with no time takes the one before it, and reads %+v", recs[1])
	}
}

func TestReadLogAnswersNothingWhereNoFileStands(t *testing.T) {
	t.Parallel()
	recs, err := readLog(fstest.MapFS{}.ReadFile, "none.jsonl")
	if err != nil || recs != nil {
		t.Fatalf("a missing file answers %v and %v, and wants nothing", recs, err)
	}
}

func TestAnOlderLineNamingItsDoorStillReadsItsKind(t *testing.T) {
	t.Parallel()
	r := ParseRecord(`{"at":"2026-09-11T15:00:01Z","level":"info","door":"tool","said":"x","tool":"Read"}`)
	if r.Kind != "tool" || r.Label() != "Read" || len(r.Extra) != 1 {
		t.Fatalf("a line from before the rename reads door as its kind, and read %+v", r)
	}
}
