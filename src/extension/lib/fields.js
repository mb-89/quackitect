// The fields a person's hold on a ticket still wants, each at the line of its
// heading, with the hover naming what it asks. The drawing and the holds come
// off the index, so a test holds it with no editor running.
// [[spec/tickets/the-lens-reads-v1]]

const { STANDING, TICKETS, standingOf, ticketOf } = require("./lens.js");

// The family each ticket's drawing stands under. [[spec/tickets/the-lens-reads-v1]]
const DRAWN = "tickets/drawn";

// The drawing of the ticket at path, off the index. [[spec/tickets/the-lens-reads-v1]]
function drawnAt(door, path) {
  return door.index?.values(`${DRAWN}/${String(path).replace(/\\/g, "/")}`);
}

// [[spec/design_output/extension#a-take-marks-the-fields]]
function fieldMarksOf(door) {
  const seen = new Set();
  let known = new Set();

  const personal = async () => (await standingOf(door)).filter((one) => one.person);

  const draws = async (path, holds) => {
    const hold = holds.find((one) => one.ticket === ticketOf(path));
    const marks = hold ? marksIn(await drawnAt(door, path), hold) : [];
    door.marksFields(path, marks);
    return marks;
  };

  return {
    names: [STANDING, TICKETS],

    // A hold standing at the start moves no cursor. [[spec/design_output/extension#a-take-marks-the-fields]]
    async starts() {
      known = new Set((await personal()).map((one) => one.ticket));
    },

    // The marks follow the saved file the index draws. [[spec/tickets/the-lens-reads-v1]]
    async sees(path) {
      if (!ticketOf(path)) return [];
      seen.add(path);
      return draws(path, await personal());
    },

    // A hold the person newly takes puts the cursor on the first mark, and every seen path draws again. [[spec/design_output/extension#a-take-marks-the-fields]]
    async held() {
      const holds = await personal();
      const now = new Set(holds.map((one) => one.ticket));
      const taken = [...now].filter((one) => !known.has(one));
      known = now;
      for (const path of seen) {
        const marks = await draws(path, holds);
        if (marks.length && taken.includes(ticketOf(path)))
          await door.jumps(path, marks[0].line);
      }
    },
  };
}

// Every field of the held leaf standing unfilled, at the line the drawing hands. [[spec/tickets/the-lens-reads-v1]]
function marksIn(drawn, hold) {
  const step = String(hold.step ?? "");
  const leaf = drawn?.leaves?.[step];
  if (!leaf) return [];
  return (leaf.fields ?? [])
    .filter((one) => !one.filled)
    .map((one) => ({
      line: one.line,
      name: one.name,
      hover: hoverOf(step, leaf, one),
    }));
}

// [[spec/design_output/extension#a-take-marks-the-fields]]
function hoverOf(path, leaf, field) {
  const says = field.says ? `: ${field.says}` : "";
  const items = field.items ?? [];
  return [
    `**${path}**: ${leaf.does}`,
    "",
    `\`${field.name}\` · ${field.form}${says}`,
    ...(items.length ? ["", ...items.map((one) => `- ${one}`)] : []),
  ].join("\n");
}

module.exports = { DRAWN, drawnAt, fieldMarksOf };
