// The http door: one request out over the network, and the answer back as
// text. A test hands in the fake, which answers from the routes it holds.
// [[spec/design_output/doors#one-door-per-outside-thing]]

export function http() {
  return {
    async send(url, { method = "GET", headers = {}, body, signal } = {}) {
      const answer = await fetch(url, { method, headers, body, signal });
      return {
        status: answer.status,
        text: await answer.text(),
        // Fetch keys each header in lower case, and the fake takes the same keys. [[spec/design_output/doors#a-fake-behaves]]
        headers: Object.fromEntries(answer.headers),
      };
    },
  };
}
