// The fields a person's hold on a ticket still wants, each at the line of its
// heading, with the hover naming what it asks.
// [[spec/design_output/extension#a-take-marks-the-fields]]

const ROUTE = "src/scripts/pull-route.js";
const CHAPTER = "src/scripts/pull-chapter.js";

// [[spec/design_output/extension#a-take-marks-the-fields]]
function fieldMarksOf() {
  return {
    watches: [],
    async starts() {},
    async sees() {
      return [];
    },
    async held() {},
  };
}

module.exports = { CHAPTER, ROUTE, fieldMarksOf };
