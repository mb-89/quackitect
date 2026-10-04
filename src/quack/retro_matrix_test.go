// The retro's matrix verb over seeded chapters and findings: a column short of
// its findings refused, and the report drawn.
// [[spec/guidance/retro/read]]
package main

import (
	"regexp"
	"strings"
	"testing"
)

// The matrix refuses a chapter without findings, and draws references with the details under them. [[spec/guidance/retro/read]]
func TestRetroMatrixRefusesAChapterWithoutFindingsAndDrawsReferencesWithTheDetails(t *testing.T) {
	root := t.TempDir()
	retroReadingLay(t, root, retroReadingName, retroReadingWith(retroReadingInput, map[string]string{
		"chapters.json": retroReadingCuts,
		"findings/c1.md": retroReadingFindings(map[string][]string{
			"stop":      {"one", "two"},
			"mechanize": {"answers c1.stop.1"},
		}),
	}))

	code, _, errs := retroReadingRun(retroMatrixVerb, root, "retro", "matrix", retroReadingName)
	if code != 1 || errs != "findings/c2.md stands nowhere\n" {
		t.Fatalf("a chapter without findings answers %d, %q", code, errs)
	}

	retroReadingLay(t, root, retroReadingName, map[string]string{
		"findings/c2.md": retroReadingFindings(map[string][]string{"keep": {"the tests"}}),
	})
	code, _, errs = retroReadingRun(retroMatrixVerb, root, "retro", "matrix", retroReadingName)
	if code != 0 {
		t.Fatalf("matrix answers %d: %s", code, errs)
	}
	report := retroReadingFile(t, root, retroReadingName, "report.md")
	for _, want := range []string{
		`\| stop \| c1\.stop\.1, c1\.stop\.2 \| · \|`,
		"- `c1\\.mechanize\\.1` answers c1\\.stop\\.1",
		`\| keep \| · \| c2\.keep\.1 \|`,
	} {
		if !regexp.MustCompile(want).MatchString(report) {
			t.Fatalf("the report holds no %s:\n%s", want, report)
		}
	}
}

// A hand-back records the verb's last line, so the line carries no path of the box. [[spec/design_output/private#the-box-names-the-owner]]
func TestRetroMatrixAnswersWithTheRetrosNameAndNoPathOfTheBox(t *testing.T) {
	root := t.TempDir()
	retroReadingLay(t, root, retroReadingName, retroReadingWith(retroReadingInput, map[string]string{
		"chapters.json":  retroReadingCuts,
		"findings/c1.md": retroReadingFindings(map[string][]string{"stop": {"one"}}),
		"findings/c2.md": retroReadingFindings(map[string][]string{"keep": {"the tests"}}),
	}))

	_, out, _ := retroReadingRun(retroMatrixVerb, root, "retro", "matrix", retroReadingName)

	want := "The report of " + retroReadingName + " draws 2 column(s), bottom line first, in its retro folder.\n"
	if out != want {
		t.Fatalf("matrix prints %q, want %q", out, want)
	}
	if strings.Contains(out, root) {
		t.Fatalf("matrix prints a path of the box: %q", out)
	}
}
