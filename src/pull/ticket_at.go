// The ticket a name finds, which every ticket verb reads first, off
// ticketAt in src/scripts/ticket.js.
// [[spec/design_output/pull#the-private-queue]]
package pull

import "strings"

// A closed note steps aside for the ticket of its name, because a note that became a ticket shares it. A name naming no ticket reads as a path under the root. It answers the path under the root, or nothing. [[spec/design_output/pull#the-private-queue]]
// Whether a name finds a ticket by its name, so the plan's working line reads as a ticket and no todo. [[spec/tickets/pull-hands-the-working-ticket]]
func namesTicket(disk Disk, name string) bool {
	return false
}

func TicketAt(disk Disk, name string) (string, bool) {
	said := strings.TrimSuffix(name, noteEnd)
	standing := []string{}
	for _, folder := range []string{Notes, Tickets} {
		if path := folder + "/" + said + noteEnd; disk.Exists(path) {
			standing = append(standing, path)
		}
	}
	for _, path := range standing {
		if text, _ := disk.Read(path); FieldOf(text, "state") != Closed {
			return path, true
		}
	}
	if len(standing) > 0 {
		return standing[0], true
	}
	return name, name != "" && disk.Exists(name)
}
