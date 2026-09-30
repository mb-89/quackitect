// The vehicle and stub verbs: every verb theVehicle and theStub in
// vehicle-verb.js answer, each standing as an action through the node module.
// [[spec/tickets/vehicle-verbs-become-actions]]
package verbs

// Every verb theVehicle in src/scripts/vehicle-verb.js answers, here among them. [[spec/tickets/vehicle-verbs-become-actions]]
var VehicleVerbs = []Verb{
	{Name: "here", Doc: "this vehicle, the project it drives, and every vehicle the register holds"},
	{Name: "produce", Doc: "copies the vehicle into a folder, which makes its own identity the first time it runs"},
	{Name: "into", Doc: "copies the vehicle into a folder standing already"},
	{Name: "attach", Doc: "names this vehicle as the one driving the project, at its port"},
	{Name: "detach", Doc: "takes the driver off the project, so the next start asks again"},
	{Name: "register", Doc: "writes this vehicle into the register"},
}

// The one verb theStub in src/scripts/vehicle-verb.js answers. [[spec/tickets/vehicle-verbs-become-actions]]
var StubVerbs = []Verb{
	{Name: "into", Doc: "writes a bare project this vehicle drives into a folder, with --upstream naming its remote"},
}
