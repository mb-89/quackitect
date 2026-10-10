// Drives the owner UI in headless Chromium: screenshots (phone light/dark, desktop) and a click test.
//   NODE_PATH=$(npm root -g) node demo/ui_check.js [outdir]
// Starts demo/ui_scenario.py (a coordinator with a mid-flight board) and stops it afterwards.
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const http = require("http");

const root = path.resolve(__dirname, "..");
const out = process.argv[2] || path.join(root, "docs");
fs.mkdirSync(out, { recursive: true });

function startScenario() {
  return new Promise((resolve, reject) => {
    const p = spawn("python3", [path.join(root, "demo", "ui_scenario.py")], { stdio: ["pipe", "pipe", "inherit"] });
    let buf = "";
    p.stdout.on("data", (d) => {
      buf += d;
      const line = buf.split("\n")[0];
      if (buf.includes("\n")) resolve({ proc: p, info: JSON.parse(line) });
    });
    p.on("error", reject);
  });
}

function getState(url, token) {
  return new Promise((resolve, reject) => {
    http.get(url + "api/state", { headers: { Authorization: "Bearer " + token } }, (res) => {
      let b = "";
      res.on("data", (d) => (b += d));
      res.on("end", () => resolve(JSON.parse(b)));
    }).on("error", reject);
  });
}

(async () => {
  const { proc, info } = await startScenario();
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const [name, opts] of [
      ["ui-phone.png", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5, colorScheme: "light" }],
      ["ui-phone-dark.png", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5, colorScheme: "dark" }],
    ]) {
      const page = await (await browser.newContext(opts)).newPage();
      await page.goto(info.url + "#token=" + info.token);
      await page.waitForSelector(".q");
      await page.screenshot({ path: path.join(out, name), fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      results.push(`${name}: ${await page.locator(".q").count()} inbox cards, ${await page.locator(".row").count()} board rows, horizontal overflow: ${overflow}`);
    }
    const desk = await (await browser.newContext({ viewport: { width: 1280, height: 860 } })).newPage();
    await desk.goto(info.url + "#token=" + info.token);
    await desk.waitForSelector(".row");
    await desk.locator('.row[data-open="T-43"]').click();
    await desk.waitForSelector("#detail .gate");
    await desk.screenshot({ path: path.join(out, "ui-desktop.png") });
    results.push("ui-desktop.png: detail pane for T-43 open");

    // click test: approve T-42's design from the phone
    const before = await getState(info.url, info.token);
    const phone = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
    await phone.goto(info.url + "#token=" + info.token);
    await phone.waitForSelector(".q");
    const card = phone.locator(".q", { hasText: "T-42" });
    await card.locator('button[data-c="approve"]').click();
    await phone.waitForFunction(() => !document.body.innerText.includes("approve step 'design'"));
    const after = await getState(info.url, info.token);
    const t42 = after.board.find((r) => r.id === "T-42");
    results.push(`click test: inbox ${before.inbox.length} -> ${after.inbox.length}; T-42 step ${t42.step} (${t42.why})`);
    if (after.inbox.length !== before.inbox.length - 1 || t42.step !== "red") throw new Error("click test failed");
    // a 'changes' answer requires a note: the UI must refuse to send it empty
    const esc = phone.locator(".q", { hasText: "T-44" });
    await esc.locator('button[data-c="no"]').click();
    await phone.waitForTimeout(300);
    const after2 = await getState(info.url, info.token);
    results.push(`answered T-44 question with 'no': inbox ${after.inbox.length} -> ${after2.inbox.length}`);
    console.log(results.join("\n"));
  } finally {
    await browser.close();
    proc.stdin.end();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
