// The queue column off the index: it reads the places the queue module
// answers, and keeps the verb's where no door answers.
// [[spec/tickets/queue-column-reads-the-index]]

package work

import "testing"

func TestTheQueueColumnReadsTheIndexPlaces(t *testing.T) {
	wasPlaces, wasQueue := runPlaces, askQueuePlaces
	t.Cleanup(func() { runPlaces, askQueuePlaces = wasPlaces, wasQueue })
	runPlaces = func(string) ([]byte, error) {
		return []byte(`{"loose":[{"name":"free","queue":"1"},{"name":"other","queue":"2"}]}`), nil
	}
	askQueuePlaces = func(string) (map[string]string, bool) {
		return map[string]string{"free": "-1", "child": "-1.1", "far": cloudPlace}, true
	}
	places, err := PlacesAt(t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	if places.Queue["free"] != "-1" || places.Queue["child"] != "-1.1" || places.Queue["other"] != "" || !places.Cloud["far"] {
		t.Fatalf("the column reads %v with cloud %v", places.Queue, places.Cloud)
	}
}

func TestTheQueueColumnKeepsTheVerbWhereNoDoorAnswers(t *testing.T) {
	wasPlaces, wasQueue := runPlaces, askQueuePlaces
	t.Cleanup(func() { runPlaces, askQueuePlaces = wasPlaces, wasQueue })
	runPlaces = func(string) ([]byte, error) {
		return []byte(`{"loose":[{"name":"free","queue":"1"}]}`), nil
	}
	askQueuePlaces = func(string) (map[string]string, bool) { return nil, false }
	places, err := PlacesAt(t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	if places.Queue["free"] != "1" {
		t.Fatalf("the column reads %v with no door", places.Queue)
	}
}
