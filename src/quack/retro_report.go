// The retro's report, bottom line first: the class fixes per category, the
// effect of the last retro, the promotions, then the matrix and every finding.
// [[spec/guidance/retro/classify]]
package main

// What the later steps wrote, each nil where its step stands open. [[spec/guidance/retro/classify]]
type retroLater struct {
	record *retroRecord
	rates  *retroRates
	effect *retroEffectRecord
}

// The whole report over the columns, and over whatever the later steps wrote. [[spec/guidance/retro/classify]]
func retroReportOf(name string, columns []retroColumn, later retroLater) string {
	return ""
}
