// The outline order of places in the queue, in the pure package every module
// reads, so the queue and the work module share one compare.
// [[spec/design_output/pull#the-queue-is-an-outline]]
package ticket

import (
	"math"
	"strconv"
	"strings"
)

// Two places compare segment by segment as numbers, so -2 stands before 1, and 1.2 before 1.10. [[spec/design_output/pull#the-queue-is-an-outline]]
func ComparePlaces(left, right string) int {
	a, b := segmentsOf(left), segmentsOf(right)
	for at := 0; at < max(len(a), len(b)); at++ {
		switch {
		case at >= len(a):
			return -1
		case at >= len(b):
			return 1
		case a[at] < b[at]:
			return -1
		case a[at] > b[at]:
			return 1
		}
	}
	return 0
}

// A segment reads as a number, an empty one as zero, and one reading as none stands past every number. [[spec/design_output/pull#the-queue-is-an-outline]]
func segmentsOf(said string) []float64 {
	out := []float64{}
	for _, part := range strings.Split(said, ".") {
		bare := strings.TrimSpace(part)
		if bare == "" {
			out = append(out, 0)
			continue
		}
		value, err := strconv.ParseFloat(bare, 64)
		if err != nil || math.IsNaN(value) {
			value = math.Inf(1)
		}
		out = append(out, value)
	}
	return out
}
