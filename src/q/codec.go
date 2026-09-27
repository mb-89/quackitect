// The JSON codec: an order-keeping value, parsed off the bytes and written
// back in the layout the JavaScript writes.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package q

// A JSON value that keeps its key order and each literal as the file writes it. [[spec/design_output/model#everything-on-disk-mirrors]]
type Ordered struct {
	Keys    []string
	Fields  []Ordered
	Items   []Ordered
	Literal string
	Object  bool
	Array   bool
}

// [[spec/design_output/model#everything-on-disk-mirrors]]
type JSONCodec struct{}

var JSON Codec[Ordered] = JSONCodec{}

func (JSONCodec) Parse(body []byte) (Ordered, error) { return Ordered{}, nil }

func (JSONCodec) Serialize(value Ordered) ([]byte, error) { return nil, nil }
