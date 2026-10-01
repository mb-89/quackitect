// The registry tabs' road to the catalog: one read a name, answering the
// value that name holds, so the fake and the /v1 door keep one contract.
// [[spec/design_output/model#the-registry-tabs]]

package registry

import "encoding/json"

// The three names the registry tabs read, spelled again here because a renderer imports no module. [[spec/design_output/model#the-registry-tabs]]
const (
	NamesName   = "index/names"
	ActionsName = "index/actions"
	DocsName    = "index/docs"
)

// [[spec/design_output/model#the-registry-tabs]]
type Catalog interface {
	Read(name string) (json.RawMessage, error)
}

// What a post of an action answers: its result once it ends within the wait, or the handle its operation reads at while it runs on. [[spec/tickets/the-work-keys-call-actions]]
type Said struct {
	Result  json.RawMessage
	Running bool
	Handle  string
}

// The road to the actions the index takes: one post a call. [[spec/tickets/the-work-keys-call-actions]]
type Caller interface {
	Call(name string, input any) (Said, error)
}
