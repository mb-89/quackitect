package main

import (
	"testing"
)

func lane(t *testing.T) Roots {
	t.Helper()
	return Roots{Method: t.TempDir(), Work: t.TempDir()}
}
