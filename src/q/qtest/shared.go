// The shared builder: a fixture built once a run, and read by every case.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package qtest

import "sync"

// A builder answering the first build on every call, which no case writes to. [[spec/design_output/model#the-guards-hold-a-baseline]]
func Shared[T any](build func() T) func() T {
	return sync.OnceValue(build)
}
