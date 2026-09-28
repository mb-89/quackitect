// The seam the index manager stands behind: the start the door takes, the step
// it hands the work loop, and the table op it keeps its operations in, which
// holds each body as bytes and names no type of the manager's.
// [[spec/design_output/model#the-index-manager]]
package index

import (
	"database/sql"
	"net"

	"quackitect/src/q"
)

// Starts the index manager over the store, the op table and a step of the work loop, and answers its stop. [[spec/design_output/model#the-index-manager]]
type Manage func(root string, store *q.Store, rows OpRows, steps func(hand func())) (stop func(), err error)

// [[spec/design_output/model#the-index-manager]]
func ServeManaged(root, at string, catalog *q.Catalog, manage Manage, starts ...Start) (func(), net.Listener, error) {
	_, stop, listen, err := opens(root, at, catalog, manage, starts...)
	return stop, listen, err
}

// The manager starts over the op table and the store, and each hand it gives joins the work loop's step. A door with no manager stops nothing. [[spec/design_output/model#the-index-manager]]
func (one *door) manages(manage Manage) (func(), error) {
	if manage == nil {
		return func() {}, nil
	}
	return manage(one.root, one.store, opKeep{one.db}, func(hand func()) { one.steps = append(one.steps, hand) })
}

// One row of the table op: the id, and the body the manager writes. [[spec/design_output/model#an-operation-outlives-callers]]
type OpRow struct {
	ID   string
	Body []byte
}

// The table op, as the door hands it to the manager. [[spec/design_output/model#an-operation-outlives-callers]]
type OpRows interface {
	Save(id string, body []byte) error
	All() ([]OpRow, error)
	Drop(id string) error
}

type opKeep struct{ db *sql.DB }

func (k opKeep) Save(id string, body []byte) error {
	_, err := k.db.Exec(`INSERT INTO op (id, body) VALUES (?, ?)
		 ON CONFLICT (id) DO UPDATE SET body = excluded.body`, id, string(body))
	return err
}

func (k opKeep) All() ([]OpRow, error) {
	rows, err := k.db.Query(`SELECT id, body FROM op ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []OpRow{}
	for rows.Next() {
		var id, body string
		if err := rows.Scan(&id, &body); err != nil {
			return nil, err
		}
		out = append(out, OpRow{ID: id, Body: []byte(body)})
	}
	return out, rows.Err()
}

func (k opKeep) Drop(id string) error {
	_, err := k.db.Exec(`DELETE FROM op WHERE id = ?`, id)
	return err
}
