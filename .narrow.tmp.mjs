import { chromium } from "@playwright/test";
const out = process.argv[2];
const browser = await chromium.launch();
for (const [w, name] of [[360, "narrow"], [412, "pixel"], [512, "wide"]]) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto("http://localhost:3100/");
  await page.getByRole("switch", { name: "Play with virtual dice" }).click();
  await page.getByLabel("Player 1 name").fill("Anna");
  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("button", { name: "Roll dice" }).click();
  await page.waitForTimeout(1800);
  await page.getByRole("button", { name: /^Die 3:/ }).click();
  await page.waitForTimeout(300);
  const cab = await page.getByRole("region", { name: "Dice" }).boundingBox();
  await page.screenshot({ path: `${out}/cab-${name}.png`, clip: { x: 0, y: cab.y - 8, width: w, height: cab.height + 16 } });
  console.log(name, "scrollWidth", await page.evaluate(() => document.documentElement.scrollWidth), "cabinet", Math.round(cab.width), Math.round(cab.height));
  await page.close();
}
await browser.close();
