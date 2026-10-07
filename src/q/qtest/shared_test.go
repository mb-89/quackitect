// The shared builder builds once.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package qtest_test

import (
	"testing"

	"quackitect/src/q/qtest"
)

func TestASharedBuildAnswersTheFirstBuild(t *testing.T) {
	t.Parallel()
	builds := 0
	shared := qtest.Shared(func() *int {
		builds++
		return &builds
	})
	first, second := shared(), shared()
	if first != second || builds != 1 {
		t.Fatalf("two calls answer %p and %p over %d builds, not one build", first, second, builds)
	}
}

func TestTwoSharedBuildersBuildApart(t *testing.T) {
	t.Parallel()
	one, two := qtest.Shared(func() int { return 1 }), qtest.Shared(func() int { return 2 })
	if one() != 1 || two() != 2 {
		t.Fatalf("two builders answer %d and %d, not 1 and 2", one(), two())
	}
}
