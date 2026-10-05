// Every module the root loads describes each name and each field it exposes,
// so the check refuses a missing description before a merge.
// [[spec/design_output/model#a-module-is-one-file]]
package main

import (
	"testing"

	"quackitect/src/modules/config"
	"quackitect/src/q"
)

func TestEveryModuleDescribesWhatItExposes(t *testing.T) {
	t.Parallel()
	c := q.New()
	c.Take(q.Main)
	for _, one := range modules {
		one.registers(c)
	}
	config.Registers(c)
	for _, registers := range projected {
		registers(c)
	}
	for _, fault := range c.Undescribed() {
		t.Error(fault)
	}
}
