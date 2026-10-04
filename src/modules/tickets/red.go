// The tests a ticket lists as red: a ticket past tests-red and short of
// tests-green names the files it expects to fail, and the check leaves them
// out until tests-green closes.
// [[spec/design_output/pull#the-gate]]
package tickets

// The files one ticket names red, sorted, and none where it stands closed, short of tests-red, or past tests-green. [[spec/design_output/pull#the-gate]]
func RedList(text string) []string {
	return nil
}

// The files one leaf names under its red field, each row a bare path. [[spec/design_output/pull#kept-red-leaves]]
func RedRows(text, path string) []string {
	return nil
}
