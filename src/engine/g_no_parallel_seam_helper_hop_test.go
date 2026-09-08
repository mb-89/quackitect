package main

import (
	"strings"
	"testing"
)

// THE PACKAGE THE CASES ARE PLANTED BESIDE. theClock is the seam, swapTheClock
// is the one hop helper that assigns it, readTheClock only reads it, and
// swapUnderALock does the swap the way the refusal asks for.
const thePackagePlantedForTheHop = `package pkg

import "sync"

var theClock = 0

var theClockLock sync.Mutex

func swapTheClock(v int) {
	theClock = v
}

func readTheClock() int {
	now := theClock
	return now
}

func swapUnderALock(v int) {
	theClockLock.Lock()
	theClock = v
	theClockLock.Unlock()
}
`


func TestAParallelTestSwappingASeamThroughAHelperRefusesTheHop(t *testing.T) {
	r := theRootsPlantedForTheHop(t)
	planted := `package pkg

import "testing"

func TestPlanted(t *testing.T) {
	t.Parallel()
	swapTheClock(3)
	if readTheClock() != 3 {
		t.Fatal("the clock did not move")
	}
}
`
	err := aParallelTestSwappingASeamThroughAHelper(r, true, "pkg/planted_test.go", planted)
	if err == nil {
		t.Fatal("a parallel test swapped theClock through swapTheClock and the door let it through")
	}
	if !strings.Contains(err.Error(), "theClock") || !strings.Contains(err.Error(), "swapTheClock") {
		t.Fatalf("the refusal names neither the seam nor the helper that swaps it: %v", err)
	}
}

func TestAParallelTestSwappingASeamThroughAHelperLetsTheCleanOnesThrough(t *testing.T) {
	r := theRootsPlantedForTheHop(t)
	reading := `package pkg

import "testing"

func TestReading(t *testing.T) {
	t.Parallel()
	if readTheClock() != 0 {
		t.Fatal("the clock started somewhere else")
	}
}
`
	if err := aParallelTestSwappingASeamThroughAHelper(r, true, "pkg/reading_test.go", reading); err != nil {
		t.Fatalf("a parallel test that only reads the seam was refused: %v", err)
	}
	serial := `package pkg

import "testing"

func TestSerial(t *testing.T) {
	swapTheClock(3)
}
`
	if err := aParallelTestSwappingASeamThroughAHelper(r, true, "pkg/serial_test.go", serial); err != nil {
		t.Fatalf("a test that runs alone and swaps the seam was refused: %v", err)
	}
	locked := `package pkg

import "testing"

func TestLocked(t *testing.T) {
	t.Parallel()
	swapUnderALock(3)
}
`
	if err := aParallelTestSwappingASeamThroughAHelper(r, true, "pkg/locked_test.go", locked); err != nil {
		t.Fatalf("a swap the helper takes a lock around was refused: %v", err)
	}
	plain := `package pkg

func theClockOf() int {
	return 0
}
`
	if err := aParallelTestSwappingASeamThroughAHelper(r, true, "pkg/clock.go", plain); err != nil {
		t.Fatalf("a file that is not a test was refused: %v", err)
	}
}

func TestTheSeamsAHelperHopSwapsNamesTheHelper(t *testing.T) {
	r := theRootsPlantedForTheHop(t)
	body := `package pkg

func TestPlanted(t *testing.T) {
	swapTheClock(3)
}
`
	swapped := theSeamsAHelperHopSwaps(r, "pkg", body)
	if swapped["theClock"] != "swapTheClock" {
		t.Fatalf("the hop out of the test body was not answered: %v", swapped)
	}
	none := `package pkg

func TestClean(t *testing.T) {
	readTheClock()
}
`
	if got := theSeamsAHelperHopSwaps(r, "pkg", none); len(got) != 0 {
		t.Fatalf("a helper that only reads the seam was answered as a swap: %v", got)
	}
}
