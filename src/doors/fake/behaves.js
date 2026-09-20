// The guard every fake takes. A call the fake lacks throws, so a test driving
// a door through a fake passes on something.
// [[spec/design_output/doors#a-fake-behaves]]

export function behaves(fake, name) {
  return new Proxy(fake, {
    get(held, key) {
      if (key in held || typeof key === "symbol") return held[key];
      throw new Error(
        `The fake ${name} holds no ${String(key)}, and the door it stands for answers it. Write it into the fake.`,
      );
    },
  });
}
