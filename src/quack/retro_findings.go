// The retro's findings: the rows every column answers, and the columns the
// readers write, one file a chapter and one for the field feedback.
// [[spec/guidance/retro/read]]
package main

// The five starfish questions, one row each. [[spec/guidance/retro/read]]
var retroQuestions = []string{"start", "stop", "keep", "more", "less"}

// The improvements, which are also the categories a class fix falls in. [[spec/guidance/retro/classify]]
var retroCategories = []string{"mechanize", "guidance", "process", "code", "tools"}

// The rows of the matrix: the questions, then the improvements. [[spec/guidance/retro/read]]
var retroRows = append(append([]string{}, retroQuestions...), retroCategories...)

// One column of the matrix: a chapter, the field feedback or an auditor, with its findings by row. [[spec/guidance/retro/read]]
type retroColumn struct {
	id       string
	title    string
	findings map[string][]string
}

// One chapter's findings: a section per row, and the items under it in order. A row with no section answers nil. [[spec/guidance/retro/read]]
func retroFindingsOf(text string) map[string][]string {
	return nil
}
