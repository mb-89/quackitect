// The battery report collect keeps beside its record: each part read as its
// median over the runs, and the last run's cases and files.
// [[spec/guidance/retro/effect]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"reflect"
	"testing"
)

// The last report a stamp keeps, with its cases and its files. [[spec/guidance/retro/effect]]
const retroMedianLast = `{"parts":{"tests":300,"rules":30},"total":330,"slowest":[{"name":"a slow case","ms":90,"file":"a.js"}],"files":[{"name":"a.js","ms":90}]}`

// [[spec/guidance/retro/effect]]
func TestRetroCollectKeepsEachPartsMedianOverTheRunsAndTheLastRunsCasesAndFiles(t *testing.T) {
	t.Parallel()
	said, _ := retroJSON(retroKeptReport(`{"battery":` + retroMedianLast + `,"runs":[{"tests":300,"rules":30},{"tests":100},{"tests":200,"rules":10}]}`)).(map[string]any)
	last, _ := retroJSON(retroMedianLast).(map[string]any)

	if !reflect.DeepEqual(said["parts"], retroJSON(`{"tests":200,"rules":20}`)) {
		t.Fatalf("the parts read %v", said["parts"])
	}
	if said["total"] != 220.0 || said["runs"] != 3.0 {
		t.Fatalf("the report totals %v over %v runs", said["total"], said["runs"])
	}
	if !reflect.DeepEqual(said["slowest"], last["slowest"]) || !reflect.DeepEqual(said["files"], last["files"]) {
		t.Fatalf("the cases and the files stay off the last run: %v", said)
	}
}

// [[spec/guidance/retro/effect]]
func TestRetroCollectReadsAStampFromBeforeTheRunsAsItsOneReportAndNoReportAsNothing(t *testing.T) {
	t.Parallel()
	said, _ := retroJSON(retroKeptReport(`{"battery":` + retroMedianLast + `}`)).(map[string]any)
	last, _ := retroJSON(retroMedianLast).(map[string]any)

	if !reflect.DeepEqual(said["parts"], last["parts"]) || said["runs"] != 1.0 {
		t.Fatalf("a stamp from before the runs reads %v", said)
	}
	for _, stamp := range []string{`{}`, `null`, `{"battery":false}`, `{"battery":0}`, `{"battery":""}`} {
		if got := retroKeptReport(stamp); got != "" {
			t.Fatalf("%s keeps %q", stamp, got)
		}
	}
}
