// The registry tabs' door. Every call this package makes to the index stands
// here, so the catalog reads the outside nowhere else.
// [[spec/design_output/model#surfaces]]

package registry

import (
	"io"
	"net/http"
	"time"
)

// One GET, answering the status code, its text and the body. [[spec/design_output/model#surfaces]]
func get(url string, within time.Duration) (int, string, []byte, error) {
	said, err := (&http.Client{Timeout: within}).Get(url)
	if err != nil {
		return 0, "", nil, err
	}
	defer said.Body.Close()
	body, err := io.ReadAll(said.Body)
	return said.StatusCode, said.Status, body, err
}
