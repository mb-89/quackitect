// The actions over /v1: one operation an action, off the registry, which
// answers within the wait the request sets with Prefer, per RFC 7240.
// [[spec/design_output/model#a-caller-sets-its-wait]]
package index

import "github.com/danielgtaylor/huma/v2"

// The name the wiring binds the http module's default wait under, in seconds. [[spec/tickets/actions-answer-over-http]]
const WaitName = "http/config/wait"

// [[spec/tickets/actions-answer-over-http]]
func (one *door) servesActions(api huma.API) {}
