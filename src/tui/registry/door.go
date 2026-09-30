// The registry tabs' door. Every call this package makes to the index stands
// here, so the catalog reads the outside nowhere else.
// [[spec/design_output/model#surfaces]]

package registry

import (
	"bytes"
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

// One POST of a JSON body with its Prefer header, answering the status code, its text and the body. [[spec/design_output/model#a-caller-sets-its-wait]]
func post(url, prefer string, body []byte, within time.Duration) (int, string, []byte, error) {
	asked, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return 0, "", nil, err
	}
	asked.Header.Set("content-type", "application/json")
	asked.Header.Set("Prefer", prefer)
	said, err := (&http.Client{Timeout: within}).Do(asked)
	if err != nil {
		return 0, "", nil, err
	}
	defer said.Body.Close()
	read, err := io.ReadAll(said.Body)
	return said.StatusCode, said.Status, read, err
}
