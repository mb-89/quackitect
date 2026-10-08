// The graph of one file alone, which the graph verb prints: the drawing's
// nodes and edges.
// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
package tickets

// A ticket reads through its front, and a process through its whole file. [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
func GraphIn(text string) Graph { return drawnOf(text).Graph }
