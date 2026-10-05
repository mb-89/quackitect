// The retro's report off its columns and the later steps' records: the field
// feedback, the battery and an open check step.
// [[spec/guidance/retro/classify]]
package main

import (
	"encoding/json"
	"regexp"
	"testing"
)

// Fails the case where the report holds no match of a pattern. [[spec/guidance/retro/classify]]
func retroReportHolds(t *testing.T, report string, patterns ...string) {
	t.Helper()
	for _, one := range patterns {
		if !regexp.MustCompile(one).MatchString(report) {
			t.Fatalf("the report holds no %s:\n%s", one, report)
		}
	}
}

// The report puts the field feedback beside the chapters. [[spec/guidance/retro/read]]
func TestRetroReportPutsTheFieldFeedbackBesideTheChapters(t *testing.T) {
	columns := []retroColumn{
		{id: "c1", title: "the morning", findings: map[string][]string{"start": {"a"}}},
		{id: "feedback", title: "field feedback", findings: map[string][]string{"code": {"b"}}},
	}

	report := retroReportOf(retroReadingName, columns, retroLater{})

	retroReportHolds(t, report,
		`\| \| c1 · the morning \| feedback · field feedback \|`,
		`\| code \| · \| feedback\.code\.1 \|`,
	)
}

// The report draws the battery beside the effect, part by part, with the cases that moved. [[spec/guidance/retro/effect]]
func TestRetroReportDrawsTheBatteryBesideTheEffectPartByPartWithTheCasesThatMoved(t *testing.T) {
	var effect retroEffectRecord
	if err := json.Unmarshal([]byte(`{"last":"retro-0000000","classes":[],"battery":{`+
		`"total":{"before":1300,"now":1820},`+
		`"parts":[{"part":"tests","before":1000,"now":1500,"delta":500}],`+
		`"fresh":[{"name":"arrives","ms":80,"file":"b.js"}],`+
		`"grown":[{"name":"grows","before":100,"ms":200}],`+
		`"gone":[{"name":"leaves","ms":50}],`+
		`"files":[{"name":"a.js","before":300,"now":400}],`+
		`"unrun":["rules"],`+
		`"red":[{"file":"a.js","name":"grows","said":"too slow"}],`+
		`"spawns":{"before":{"all":200,"vale":150},"now":{"all":20,"vale":8}}}}`), &effect); err != nil {
		t.Fatal(err)
	}

	report := retroReportOf(retroReadingName, nil, retroLater{effect: &effect})

	retroReportHolds(t, report,
		`### The battery`,
		`1300 ms at the last retro, 1820 ms at this one\.`,
		`\| tests \| 1000 \| 1500 \| 500 \|`,
		`- b\.js · arrives \(80 ms\)`,
		`- grows \(100 to 200 ms\)`,
		`- leaves \(50 ms\)`,
		`Spawns: 20 spawns, 8 of them Vale, against 200 spawns, 150 of them Vale at the last retro\.`,
		`\| a\.js \| 300 \| 400 \|`,
		`Parts left unrun:\n\n- rules`,
		`- a\.js · grows: too slow`,
	)
	bare := retroReportOf(retroReadingName, nil, retroLater{effect: &retroEffectRecord{Classes: []retroEffectRow{}}})
	if regexp.MustCompile(`The battery`).MatchString(bare) {
		t.Fatalf("an effect with no battery draws one:\n%s", bare)
	}
}

// A class with no status stands open at the retro's check step, and the report names that step. [[spec/guidance/retro/check]]
func TestRetroReportReadsAClassTheCheckStepLeavesOpenSo(t *testing.T) {
	record := retroRecordOf(`{"classes":[{"id":"k1","class":"one class","category":"` + retroCategories[0] +
		`","defect":"a defect","fix":"a fix"}],"dispositions":{}}`)
	if record == nil {
		t.Fatal("the record reads as no JSON")
	}
	var rates retroRates
	if err := json.Unmarshal([]byte(`{"hours":1,"classes":{"k1":{"count":1,"rate":1}}}`), &rates); err != nil {
		t.Fatal(err)
	}

	report := retroReportOf(retroReadingName, nil, retroLater{record: record, rates: &rates})

	retroReportHolds(t, report, `\| the check step stands open \|`)
}
