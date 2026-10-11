// The /v1 client: a read to an index that takes the connection and holds it silent ends on an error within its bound, the bound's door test.
// [[spec/tickets/v1-client-carries-a-bound]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"net"      // level0: OutsideInDoors - the case stands a listener that holds every connection silent, the bound's door test
	"net/http" // level0: OutsideInDoors - the case asks the listener as the /v1 client asks the index
	"testing"
	"time"
)

// A read to a wedged index ends on an error within the bound it carries. [[spec/tickets/v1-client-carries-a-bound]]
func TestTheV1ClientCarriesABound(t *testing.T) {
	t.Parallel()
	wedged, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	defer wedged.Close()
	go func() {
		for {
			if _, err := wedged.Accept(); err != nil {
				return
			}
		}
	}()
	asked, err := http.NewRequest(http.MethodGet, "http://"+wedged.Addr().String()+"/v1/values/x", nil)
	if err != nil {
		t.Fatal(err)
	}
	var said any
	if err := answers(asked, &said, 50*time.Millisecond); err == nil {
		t.Fatal("a read to a wedged index answers no error")
	}
}
