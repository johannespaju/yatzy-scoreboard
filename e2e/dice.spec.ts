import { expect, test, type Page } from "@playwright/test";

// Reduced motion makes the reels settle instantly, so the tests never wait on animations.
test.use({ reducedMotion: "reduce" });

async function startDiceGame(page: Page, names: string[]) {
  await page.goto("/");
  await page.getByRole("switch", { name: "Play with virtual dice" }).click();
  for (const [i, name] of names.entries()) {
    if (i >= 2) await page.getByRole("button", { name: "Add player" }).click();
    await page.getByLabel(`Player ${i + 1} name`).fill(name);
  }
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByRole("button", { name: "Roll dice" })).toBeVisible();
}

function cell(page: Page, player: string, category: string) {
  return page.getByRole("button", { name: `${player}, ${category}`, exact: true });
}

function die(page: Page, index: number) {
  return page.getByRole("button", { name: new RegExp(`^Die ${index}:`) });
}

/** Reads the five die values from their labels, e.g. "Die 1: 4, held". */
async function readDice(page: Page): Promise<number[]> {
  const values: number[] = [];
  for (let i = 1; i <= 5; i++) {
    const label = await die(page, i).getAttribute("aria-label");
    values.push(Number(label?.match(/: (\d)/)?.[1]));
  }
  return values;
}

test("rolls, holds, scores from the dice and passes the turn", async ({ page }) => {
  await startDiceGame(page, ["Anna", "Bo"]);

  // Nothing can be scored before the first roll.
  await expect(cell(page, "Anna", "Chance")).toBeDisabled();
  await expect(cell(page, "Bo", "Chance")).toBeDisabled();

  await page.getByRole("button", { name: "Roll dice" }).click();
  await expect(page.getByText("2 rolls left")).toBeVisible();
  const first = await readDice(page);
  const sum = first.reduce((a, b) => a + b, 0);
  await expect(cell(page, "Anna", "Chance")).toHaveText(String(sum));
  await expect(cell(page, "Bo", "Chance")).toBeDisabled();

  // Hold the first die and roll again: it must keep its value.
  await die(page, 1).click();
  await expect(die(page, 1)).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Roll dice" }).click();
  await expect(page.getByText("1 roll left")).toBeVisible();
  const second = await readDice(page);
  expect(second[0]).toBe(first[0]);

  // Scoring writes the preview value and starts Bo's turn with fresh dice.
  const chance = second.reduce((a, b) => a + b, 0);
  await cell(page, "Anna", "Chance").click();
  await expect(cell(page, "Anna", "Chance")).toHaveText(String(chance));
  await expect(page.getByText("3 rolls left")).toBeVisible();
  await expect(cell(page, "Anna", "Ones")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Roll dice" })).toBeEnabled();

  // Undo puts the score and the dice back.
  await page.getByRole("button", { name: `Undo Chance ${chance}` }).click();
  await expect(cell(page, "Anna", "Chance")).toHaveText(String(chance)); // preview again
  await expect(page.getByText("1 roll left")).toBeVisible();
  expect(await readDice(page)).toEqual(second);
});

test("allows three rolls per turn", async ({ page }) => {
  await startDiceGame(page, ["Anna"]);
  const roll = page.getByRole("button", { name: "Roll dice" });
  await roll.click();
  await roll.click();
  await roll.click();
  await expect(page.getByText("No rolls left")).toBeVisible();
  await expect(roll).toBeDisabled();
  await expect(die(page, 1)).toBeDisabled();
});

test("keeps the dice across a reload", async ({ page }) => {
  await startDiceGame(page, ["Anna"]);
  await page.getByRole("button", { name: "Roll dice" }).click();
  await die(page, 2).click();
  await die(page, 3).click();
  const before = await readDice(page);

  await page.reload();
  await expect(page.getByText("2 rolls left")).toBeVisible();
  expect(await readDice(page)).toEqual(before);
  await expect(die(page, 2)).toHaveAttribute("aria-pressed", "true");
  await expect(die(page, 3)).toHaveAttribute("aria-pressed", "true");
  await expect(die(page, 1)).toHaveAttribute("aria-pressed", "false");
});

test("paper games have no dice", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Player 1 name").fill("Anna");
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByRole("heading", { name: "Scandinavian Yatzy" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Roll dice" })).toHaveCount(0);
  await expect(cell(page, "Anna", "Chance")).toBeEnabled();
});
