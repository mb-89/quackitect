// The widget vocabulary, in one place.
//
// IT WAS WRITTEN OUT ELEVEN TIMES AND CARRIED FOUR DIFFERENT ANSWERS. Six in
// the renderer and its two callers, seven in the mirror's route gate, five in
// se_shoot's cast, and four in the words se_shoot shows the agent. Two of the
// four were live: the route gate admitted a widget the renderer has no branch
// for, and the tool description named four of the six that work.
//
// IT IMPORTS NOTHING, so every layer can reach it without a cycle.

export const WIDGET_KINDS = ["machine", "details", "log", "terminal", "table", "trace"] as const;

export type WidgetKind = (typeof WIDGET_KINDS)[number];

/** Narrows, so a caller checks instead of casting. A cast is what let the
 *  route gate hand the renderer a kind it cannot draw. */
export function isWidgetKind(s: string): s is WidgetKind {
  return (WIDGET_KINDS as readonly string[]).includes(s);
}

/** The vocabulary as a READER sees it, so a tool description cannot drift
 *  from what the renderer serves. */
export const WIDGET_LIST = WIDGET_KINDS.join(" | ");
