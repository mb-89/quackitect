// The rows the work tab draws as it opens, which the sidebar's button counts.
// [[spec/design_output/tui#the-work-tab]]

package work

// The tab opens on the index's tree, lays the verb's places over it, and presses the base file's preset, so the count takes the same three roads. [[spec/design_output/tui#the-work-tab]]
func Drawn(path string) (int, error) {
	drawn, err := Load(path)
	if err != nil {
		return 0, err
	}
	said, err := runPlaces(Root(path))
	if err != nil {
		return 0, err
	}
	places, err := PlacesIn(said)
	if err != nil {
		return 0, err
	}
	Placed(drawn, places)
	if err := drawn.Filtering(drawn.Opening()); err != nil {
		return 0, err
	}
	return drawn.Len(), nil
}
