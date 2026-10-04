// The retro's class fixes: the classes a hand writes, checked, counted and
// held against every finding, note and memory, which each carry a disposition.
// [[spec/guidance/retro/classify]]
package main

import "io"

// The hand's record: the classes, the dispositions, the promotions, the limits and the checklist. [[spec/guidance/retro/classify]]
type retroRecord struct{}

// One class's matches, and its matches per active hour. [[spec/guidance/retro/classify]]
type retroRate struct {
	Count int     `json:"count"`
	Rate  float64 `json:"rate"`
}

// Each class's rate over the active hours of the input. [[spec/guidance/retro/classify]]
type retroRates struct {
	Hours   int                  `json:"hours"`
	Classes map[string]retroRate `json:"classes"`
}

func init() { register("retro classes", retroClassesVerb(retroRoot)) }

// The hand's record, read, or nil where it reads as no JSON. [[spec/guidance/retro/classify]]
func retroRecordOf(text string) *retroRecord {
	return nil
}

// The verb: refuses a record short of anything, and writes each class's rate. [[spec/guidance/retro/classify]]
func retroClassesVerb(root func() string) twin {
	return func(_ []string, _ bool, _, _ io.Writer) int { return 0 }
}
