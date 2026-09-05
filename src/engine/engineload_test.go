package main

import (
	"encoding/json"
	"errors"
	"os"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

// THE ENGINE UNDER LOAD: EVERY CALL IS ANSWERED, AND A LONG ONE SAYS WHERE.
//
// With six agents on one box the lane answered "answers no questions yet.
// Start it again" between two calls that both answered, and a se_test that
// outran the lane's sixty seconds read as a dead engine with its result lost.

func TestConcurrentCallsAreAllAnswered(t *testing.T) {
	r, addr := aModelServed(t)
	now := time.Now().UTC().Format(time.RFC3339)
	// THE RECORD FLAPS, the way it did with a second engine beating beside
	// the first: one beat names the socket and the next names none.
	stop := make(chan struct{})
	flapping := make(chan struct{})
	go func() {
		defer close(flapping)
		for i := 0; ; i++ {
			select {
			case <-stop:
				return
			default:
			}
			v := Running{PID: os.Getpid(), Started: now, Beat: now}
			if i%2 == 0 {
				v.Socket = addr
			}
			SayRunning(r, v)
			time.Sleep(time.Millisecond)
		}
	}()
	var wg sync.WaitGroup
	var answered, dropped atomic.Int32
	var reasons sync.Map
	for agent := 0; agent < 4; agent++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for call := 0; call < 5; call++ {
				_, err := askModelForAnAnswer(r, "ping", nil, time.Second)
				if errors.Is(err, ErrNoEngine) {
					dropped.Add(1)
					reasons.Store(err.Error(), true)
					continue
				}
				answered.Add(1) // answered, or refused with a reason
			}
		}()
	}
	wg.Wait()
	close(stop)
	<-flapping
	if dropped.Load() != 0 {
		var said []string
		reasons.Range(func(k, _ any) bool { said = append(said, k.(string)); return true })
		t.Fatalf("%d of 20 calls were told no engine is running while one answered: %s", dropped.Load(), strings.Join(said, " / "))
	}
	if answered.Load() != 20 {
		t.Fatalf("%d of 20 calls were answered", answered.Load())
	}
}

func TestALongTestAnswersWhereItLands(t *testing.T) {
	r, _ := aTreeWithTests(t)
	db := openTheIndex(t, r)
	// THE RUN OUTLIVES THE WAIT. The fed run is made slow, and the wait
	// short, so the test costs a moment and not a minute.
	fed := theToolchain.runOne
	theToolchain.runOne = func(bin, dir, test, profile string, env []string) ([]byte, error) {
		time.Sleep(200 * time.Millisecond)
		return fed(bin, dir, test, profile, env)
	}
	was := theTestBudget
	theTestBudget = 20 * time.Millisecond
	t.Cleanup(func() { theTestBudget = was })
	got, err := TestTheDelta(t.Context(), r, db, "", []string{"TestA"}, true, "worker-one")
	if err != nil {
		t.Fatal(err)
	}
	if got.Lands == "" {
		t.Fatal("a run longer than the wait answered nothing about where its result lands, so the lane's ceiling cuts it with the answer lost")
	}
	if len(got.Ran) != 1 || got.Ran[0].Kind != "landing" || !strings.Contains(got.Ran[0].Said, got.Lands) {
		t.Fatalf("the answer's ran is %+v, and a run still going is one landing entry naming %s", got.Ran, got.Lands)
	}
	// THEN THE ANSWER LANDS, WHOLE.
	var final Tested
	deadline := time.Now().Add(5 * time.Second)
	for {
		b, err := os.ReadFile(got.Lands)
		if err == nil && json.Unmarshal(b, &final) == nil {
			break
		}
		if time.Now().After(deadline) {
			t.Fatalf("nothing landed in %s within five seconds", got.Lands)
		}
		time.Sleep(10 * time.Millisecond)
	}
	if !final.OK || len(final.Ran) != 1 || !strings.HasSuffix(final.Ran[0].ID, "TestA") || final.Lands != "" {
		t.Fatalf("what landed says ok %v, ran %+v, lands %q, and the run was TestA, passing, landed", final.OK, final.Ran, final.Lands)
	}
}
