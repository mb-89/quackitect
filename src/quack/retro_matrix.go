// The retro's report as a verb: it refuses a chapter standing without its
// findings, and draws what the later steps wrote above the matrix.
// [[spec/guidance/retro/read]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

// The report a retro draws. [[spec/guidance/retro/read]]
const retroReportFile = "report.md"

func init() { register("retro matrix", retroMatrixVerb(retroRoot)) }

// The verb: refuses a column short of its findings, and writes the report. [[spec/guidance/retro/read]]
func retroMatrixVerb(root func() string) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		base, name := root(), retroWordAt(argv, 2)
		home := ""
		if name != "" {
			home = retroHome(base, name)
		}
		if home == "" || !retroIsThere(filepath.Join(home, retroCutsFile)) {
			fmt.Fprintln(errs, "retro matrix reads the chapters of a retro, and none stand: ./RUNME.sh retro chapters <retro>")
			return 2
		}
		columns, faults := retroColumnsOf(home)
		if len(faults) > 0 {
			for _, one := range faults {
				fmt.Fprintln(errs, one)
			}
			return 1
		}
		later := retroLater{}
		if text := retroFileText(filepath.Join(home, retroClassesFile)); text != "" {
			later.record = retroRecordOf(text)
		}
		if text := retroFileText(filepath.Join(home, retroRatesFile)); text != "" {
			later.rates = &retroRates{}
			if err := json.Unmarshal([]byte(text), later.rates); err != nil {
				fmt.Fprintf(errs, "%s: %v\n", retroRatesFile, err)
				return 1
			}
		}
		if text := retroFileText(filepath.Join(home, retroEffectFile)); text != "" {
			later.effect = &retroEffectRecord{}
			if err := json.Unmarshal([]byte(text), later.effect); err != nil {
				fmt.Fprintf(errs, "%s: %v\n", retroEffectFile, err)
				return 1
			}
		}
		if err := os.WriteFile(filepath.Join(home, retroReportFile), []byte(retroReportOf(name, columns, later)), 0o666); err != nil {
			fmt.Fprintln(errs, err)
			return 1
		}
		fmt.Fprintf(out, "The report of %s draws %d column(s), bottom line first, in its retro folder.\n", name, len(columns))
		return 0
	}
}
