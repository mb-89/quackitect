// The http module declares its default wait, which reads none until a layer sets it.
// [[spec/design_output/model#a-caller-sets-its-wait]]
package http

import (
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

func TestTheWaitKeyReadsNoneByDefault(t *testing.T) {
	ix := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	if wait := ix.Read("config/" + WaitKey); wait != 0 {
		t.Fatalf("the default wait reads %#v", wait)
	}
}
