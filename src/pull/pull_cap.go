// The size cap. One answer of the pull reaches the model whole, so a hand-out
// past the cap less its margin splits at a line, the hold carries the rest,
// and the next pull on the same step prints it.
// [[spec/design_input/level-two#the-size-cap]]
package pull

import (
	"strings"
	"unicode/utf8"
)

// The line closing a part, which names the pull printing the rest. [[spec/design_input/level-two#the-size-cap]]
func (it *It) runsOn(held *Hold) string {
	as := ""
	if held != nil {
		if named := it.asOf(*held); named != "" {
			as = " --as " + named
		}
	}
	return "\n\nThe hand-out runs on past the cap: run ./RUNME.sh ticket pull" + as + " again for the rest."
}

// The bytes a part holds with its closing line, and 0 where no cap stands, so nothing splits. [[spec/design_input/level-two#the-size-cap]]
func (it *It) roomOf(held *Hold) int {
	if it.CapBytes <= 0 {
		return 0
	}
	return max(1, it.CapBytes-it.CapMargin-len(it.runsOn(held)))
}

// The text whole where it fits in room, and else the lines that fit and the rest. A first line longer than room cuts at the last character inside it. [[spec/design_input/level-two#the-size-cap]]
func partOf(text string, room int) (string, string) {
	if room <= 0 || len(text) <= room {
		return text, ""
	}
	rows := strings.Split(text, "\n")
	head, used := []string{}, 0
	for _, row := range rows {
		if used+len(row)+1 > room {
			break
		}
		head = append(head, row)
		used += len(row) + 1
	}
	if len(head) > 0 {
		return strings.Join(head, "\n"), strings.Join(rows[len(head):], "\n")
	}
	cut := 0
	for at, r := range rows[0] {
		if at+utf8.RuneLen(r) > room {
			break
		}
		cut = at + utf8.RuneLen(r)
	}
	if cut == 0 {
		_, size := utf8.DecodeRuneInString(rows[0])
		cut = max(size, 1)
	}
	return rows[0][:cut], text[cut:]
}

// A refusal past the room keeps its head, and a closing line names the verb printing the notes whole. [[spec/design_input/level-two#the-size-cap]]
func (it *It) cutRefusal(text, more string) string {
	head, rest := partOf(text, max(0, it.roomOf(nil)-len("\n"+more)))
	if rest != "" {
		return head + "\n" + more
	}
	return head
}

// Prints the part that fits, and writes what stays into the hold. [[spec/design_input/level-two#the-size-cap]]
func (it *It) printPart(hold Hold, text string) int {
	head, rest := partOf(text, it.roomOf(&hold))
	hold.Rest = rest
	it.writeHold(hold.Hand, hold)
	if rest != "" {
		it.Println(head + it.runsOn(&hold))
		return 0
	}
	it.Println(head)
	return 0
}
