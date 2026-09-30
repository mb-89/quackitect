// An http door a test hands in. It answers from the routes the test registers,
// keyed by the method and the address before its query, and keeps each request.
// [[spec/design_output/doors#a-fake-behaves]]

import { behaves } from "./behaves.js";

export function fakeHttp(routes = {}) {
  const sent = [];
  return behaves(
    {
      sent,
      async send(url, { method = "GET", headers = {}, body } = {}) {
        const request = { url, method, headers, body };
        sent.push(request);
        const route = routes[`${method} ${String(url).split("?")[0]}`];
        if (!route)
          throw new Error(
            `The fake http holds no route for ${method} ${url}, and the door it stands for sends it. Register the route.`,
          );
        const said = route(request);
        return {
          status: said.status,
          text: said.text ?? "",
          headers: said.headers ?? {},
        };
      },
    },
    "http",
  );
}
