// The ticket verbs and the pull in Go: the reads every verb shares, the
// writes, and the pull itself, off src/scripts/ticket.js and pull*.js. No
// file here reaches the outside, which comes in through the doors below.
// [[spec/tickets/ticket-verbs-port-to-go]]
package pull

// The disk under the root, by slashed paths relative to it. [[spec/tickets/ticket-verbs-port-to-go]]
type Disk interface {
	Read(path string) (string, bool)
	Exists(path string) bool
	// The files a folder holds, by name, and none where it stands nowhere.
	Files(folder string) []string
	Write(path, text string) error
}

// A disk in memory, which every case of this package writes to. [[spec/tickets/ticket-verbs-port-to-go]]
type FakeDisk map[string]string

func (one FakeDisk) Read(path string) (string, bool) {
	text, ok := one[path]
	return text, ok
}

func (one FakeDisk) Exists(path string) bool {
	if _, ok := one[path]; ok {
		return true
	}
	for held := range one {
		if len(held) > len(path) && held[:len(path)+1] == path+"/" {
			return true
		}
	}
	return false
}

func (one FakeDisk) Files(folder string) []string {
	out := []string{}
	for held := range one {
		if len(held) <= len(folder)+1 || held[:len(folder)+1] != folder+"/" {
			continue
		}
		if name := held[len(folder)+1:]; !containsSlash(name) {
			out = append(out, name)
		}
	}
	sortStrings(out)
	return out
}

func (one FakeDisk) Write(path, text string) error {
	one[path] = text
	return nil
}

func containsSlash(said string) bool {
	for _, r := range said {
		if r == '/' {
			return true
		}
	}
	return false
}
