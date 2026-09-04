package main

import (
	"sync"
	"testing"
)

// TWO AGENTS SPENDING GRACE AT ONCE BOTH SPEND IT.
//
// countGrace read the file, changed one key and wrote it back whole, with no
// lock, while the obligations beside it in the same store went through
// changeOwed precisely because unsynchronised writes lost them. Two agents
// overlapping lost increments and were given more grace than the rule allows.
func TestConcurrentGraceChangesBothSurvive(t *testing.T) {
	t.Parallel()
	r := lane(t)
	actors := []string{"main", "reviewer1"}
	const calls = 100

	start := make(chan struct{})
	var wg sync.WaitGroup
	var mu sync.Mutex
	last := map[string]int{}
	for _, actor := range actors {
		wg.Add(1)
		go func(actor string) {
			defer wg.Done()
			<-start
			n := 0
			for i := 0; i < calls; i++ {
				n = countGrace(r, actor)
			}
			mu.Lock()
			last[actor] = n
			mu.Unlock()
		}(actor)
	}
	close(start)
	wg.Wait()

	for _, actor := range actors {
		if last[actor] != calls {
			t.Errorf("%s made %d calls and its count says %d, so increments were lost",
				actor, calls, last[actor])
		}
	}
}
