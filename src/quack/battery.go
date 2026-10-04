// The battery's report and the stamp the check leaves: the parts as timed,
// the slowest cases, a time a test file, the red cases, the spawns, and the
// record a door reads before a push. Every function takes text or rows.
// [[spec/guidance/retro/effect]] [[spec/design_output/work#the-battery-answers-first]]
package main

// One case the runner's reporter wrote. [[spec/guidance/retro/effect]]
type caseRow struct {
	File    string  `json:"file"`
	Name    string  `json:"name"`
	Nesting int     `json:"nesting"`
	Ms      float64 `json:"ms"`
	Ok      bool    `json:"ok"`
	Todo    bool    `json:"todo"`
	Said    string  `json:"said"`
}

type slowCase struct {
	Name string  `json:"name"`
	Ms   float64 `json:"ms"`
	File string  `json:"file"`
}

type fileTime struct {
	Name string `json:"name"`
	Ms   int64  `json:"ms"`
}

type redCase struct {
	File string `json:"file"`
	Name string `json:"name"`
	Said string `json:"said"`
}

type spawnTally struct {
	All  int `json:"all"`
	Vale int `json:"vale"`
}

// One report of the battery. [[spec/guidance/retro/effect]]
type batteryReport struct {
	Parts   map[string]int64 `json:"parts"`
	Total   int64            `json:"total"`
	Slowest []slowCase       `json:"slowest"`
	Files   []fileTime       `json:"files"`
	Unrun   []string         `json:"unrun"`
	Red     []redCase        `json:"red"`
	Spawns  *spawnTally      `json:"spawns"`
}

// One finding the lint left standing. [[spec/design_output/work#the-battery-answers-first]]
type finding struct {
	File   string `json:"file"`
	Source string `json:"source"`
}

// The stamp's shape. [[spec/design_output/work#the-battery-answers-first]]
type checkStamp struct {
	Sha      string             `json:"sha"`
	Ok       bool               `json:"ok"`
	Clean    bool               `json:"clean"`
	At       string             `json:"at"`
	Warnings int                `json:"warnings"`
	Files    []string           `json:"files"`
	Battery  *batteryReport     `json:"battery,omitempty"`
	Runs     []map[string]int64 `json:"runs,omitempty"`
}

func rowsIn(lines string) []caseRow                { return nil }
func slowestIn(lines string, most int) []slowCase { return nil }
func filesIn(lines string) []fileTime             { return nil }
func redIn(lines string) []redCase                { return nil }
func spawnsIn(tally string) spawnTally            { return spawnTally{} }

func batteryOf(parts map[string]float64, lines string, most int, unrun []string, spawns *spawnTally, span float64) batteryReport {
	return batteryReport{}
}

func partsSaid(report batteryReport, budget int64) []string { return nil }

func stampFor(code int, sha string, clean bool, at string, stood []finding, report *batteryReport, before []byte, keep int) checkStamp {
	return checkStamp{}
}
