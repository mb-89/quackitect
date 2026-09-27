// The scheduler: runs a derived provider when a name it reads moves, one run
// at a time, with one pending run kept while one runs.
// [[spec/design_output/model#the-provider-kinds]]
package q

type Scheduler struct{}

// A run starts through spawn, so a case controls it. A run that errs reaches failed. [[spec/design_output/model#the-provider-kinds]]
func NewScheduler(s *Store, spawn func(run func()), failed func(name string, err error)) *Scheduler {
	return &Scheduler{}
}

// Blocks until no provider runs or waits. [[spec/design_output/model#the-provider-kinds]]
func (one *Scheduler) Settle() {}
