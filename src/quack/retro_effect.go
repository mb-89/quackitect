// The effect of the last retro: its class patterns counted again over this
// retro's input, beside the rates it measured, and the battery against its own.
// [[spec/guidance/retro/effect]]
package main

import "io"

// One of the slowest cases: its file, its name, its time, and its time at the last retro where it grew. [[spec/guidance/retro/effect]]
type retroCase struct {
	File   string   `json:"file,omitempty"`
	Name   string   `json:"name"`
	Ms     float64  `json:"ms"`
	Before *float64 `json:"before,omitempty"`
}

// The battery's span at the last retro and at this one. [[spec/guidance/retro/effect]]
type retroBatteryTotal struct {
	Before float64 `json:"before"`
	Now    float64 `json:"now"`
}

// One part's time at the last retro and at this one. [[spec/guidance/retro/effect]]
type retroBatteryPart struct {
	Part   string  `json:"part"`
	Before float64 `json:"before"`
	Now    float64 `json:"now"`
	Delta  float64 `json:"delta"`
}

// One test file's time at the last retro and at this one. [[spec/guidance/retro/effect]]
type retroBatteryFile struct {
	Name   string  `json:"name"`
	Before float64 `json:"before"`
	Now    float64 `json:"now"`
}

// A red case in its own words. [[spec/guidance/retro/effect]]
type retroRed struct {
	File string `json:"file"`
	Name string `json:"name"`
	Said string `json:"said"`
}

// The spawns a run made, and how many of them are Vale. [[spec/guidance/retro/effect]]
type retroTally struct {
	All  float64 `json:"all"`
	Vale float64 `json:"vale"`
}

// The spawns at the last retro and at this one. [[spec/guidance/retro/effect]]
type retroSpawns struct {
	Before *retroTally `json:"before"`
	Now    *retroTally `json:"now"`
}

// This retro's battery against the last retro's. [[spec/guidance/retro/effect]]
type retroBatteryRecord struct {
	Last     string             `json:"last"`
	Baseline bool               `json:"baseline,omitempty"`
	Total    retroBatteryTotal  `json:"total"`
	Parts    []retroBatteryPart `json:"parts"`
	Fresh    []retroCase        `json:"fresh"`
	Grown    []retroCase        `json:"grown"`
	Gone     []retroCase        `json:"gone"`
	Files    []retroBatteryFile `json:"files"`
	Unrun    []string           `json:"unrun"`
	Red      []retroRed         `json:"red"`
	Spawns   *retroSpawns       `json:"spawns"`
	Slowest  []retroCase        `json:"slowest"`
}

// One class of the last retro, counted again here. [[spec/guidance/retro/effect]]
type retroEffectRow struct {
	ID      string    `json:"id"`
	Class   string    `json:"class"`
	Fix     string    `json:"fix"`
	Tickets []string  `json:"tickets"`
	Before  retroRate `json:"before"`
	Now     retroRate `json:"now"`
	Verdict string    `json:"verdict"`
}

// The effect a retro writes: the last retro, its classes counted again, and the battery. [[spec/guidance/retro/effect]]
type retroEffectRecord struct {
	Last    string              `json:"last"`
	Classes []retroEffectRow    `json:"classes"`
	Battery *retroBatteryRecord `json:"battery"`
}

func init() { register("retro effect", retroEffectVerb(retroRoot)) }

// The two batteries side by side, or nil where this retro holds none. [[spec/guidance/retro/effect]]
func retroBatteryEffectOf(root, name, last string) *retroBatteryRecord {
	return nil
}

// A class's verdict: gone, falls, holds or grows. [[spec/guidance/retro/effect]]
func retroVerdictOf(before, now retroRate) string {
	return ""
}

// The verb: counts the last retro's classes over this input, and writes each verdict. [[spec/guidance/retro/effect]]
func retroEffectVerb(root func() string) twin {
	return func(_ []string, _ bool, _, _ io.Writer) int { return 0 }
}
