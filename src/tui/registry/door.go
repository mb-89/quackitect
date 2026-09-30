// The registry tabs' door. Every call this package makes to the index stands
// here, so the catalog reads the outside nowhere else.
// [[spec/design_output/model#surfaces]]

package registry

import (
	"context"
	"io"
	"net/http"
	"time"
)

// One GET left open until the context ends, answering the status code, its text and the body to read. [[spec/tickets/v1-watch-sends-changes]]
func stream(ctx context.Context, url string) (int, string, io.ReadCloser, error) {
	asked, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return 0, "", nil, err
	}
	said, err := http.DefaultClient.Do(asked)
	if err != nil {
		return 0, "", nil, err
	}
	return said.StatusCode, said.Status, said.Body, nil
}

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
