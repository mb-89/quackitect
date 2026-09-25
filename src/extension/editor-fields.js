// The marks over the fields a ticket still wants: the underline and the hover.
// lib/fields.js holds every choice, and this holds the calls into vscode.
// [[spec/design_output/extension#a-take-marks-the-fields]]

// [[spec/design_output/extension#a-take-marks-the-fields]]
function fieldDoor() {
  return {
    marksFields() {},
  };
}

module.exports = { fieldDoor };
