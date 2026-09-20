import { expect, test, type Page } from "@playwright/test";

// Every category in sheet order, with a valid score for each. Sums to 63 in the
// upper section (bonus threshold), 332 in total with the bonus.
const FULL_SHEET: [string, number][] = [
  ["Ones", 3],
  ["Twos", 6],
  ["Threes", 9],
  ["Fours", 12],
  ["Fives", 15],
  ["Sixes", 18],
  ["One Pair", 12],
  ["Two Pairs", 22],
  ["Three of a Kind", 18],
  ["Four of a Kind", 24],
  ["Small Straight", 15],
  ["Large Straight", 20],
  ["Full House", 28],
  ["Chance", 30],
  ["Yatzy", 50],
];

async function startGame(page: Page, names: string[]) {
  await page.goto("/");
  for (const [i, name] of names.entries()) {
    if (i >= 2) await page.getByRole("button", { name: "Add player" }).click();
    await page.getByLabel(`Player ${i + 1} name`).fill(name);
  }
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByRole("heading", { name: "Scandinavian Yatzy" })).toBeVisible();
}

function cell(page: Page, player: string, category: string) {
  return page.getByRole("button", { name: `${player}, ${category}`, exact: true });
}

async function enterScore(page: Page, player: string, category: string, value: number) {
  await cell(page, player, category).click();
  await page.getByLabel("Score").fill(String(value));
  await page.getByRole("button", { name: "Save" }).click();
  await expect(cell(page, player, category)).toHaveText(String(value));
}

test.describe("game", () => {
  test("starts a game and shows the players", async ({ page }) => {
    await startGame(page, ["Anna", "Bo"]);
    await expect(page.getByRole("columnheader", { name: "Anna" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Bo" })).toBeVisible();
  });

  test("enters, rejects, scratches and clears scores", async ({ page }) => {
    await startGame(page, ["Anna", "Bo"]);

    await enterScore(page, "Anna", "Fours", 12);

    // Invalid value: Save is disabled and the hint shows the valid values.
    await cell(page, "Bo", "Fours").click();
    await page.getByLabel("Score").fill("13");
    await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();
    await expect(page.getByLabel("Score")).toHaveAttribute("aria-invalid", "true");

    await page.getByRole("button", { name: "Scratch" }).click();
    await expect(cell(page, "Bo", "Fours")).toHaveText("0");

    // Clear brings the cell back to empty.
    await cell(page, "Anna", "Fours").click();
    await page.getByRole("button", { name: "Clear" }).click();
    await expect(cell(page, "Anna", "Fours")).toHaveText("–");
  });

  test("survives a page reload", async ({ page }) => {
    await startGame(page, ["Anna"]);
    await enterScore(page, "Anna", "Sixes", 24);

    await page.reload();

    await expect(page.getByRole("columnheader", { name: "Anna" })).toBeVisible();
    await expect(cell(page, "Anna", "Sixes")).toHaveText("24");
  });

  test("calculates bonus and total and ends the game", async ({ page }) => {
    await startGame(page, ["Anna"]);
    for (const [category, value] of FULL_SHEET) {
      await enterScore(page, "Anna", category, value);
    }

    const row = (label: string) => page.getByRole("row", { name: label });
    await expect(row("Sum")).toContainText("63");
    await expect(row("Bonus")).toContainText("50");
    await expect(row("Total")).toContainText("332");

    await expect(page.getByRole("heading", { name: "Game over" })).toBeVisible();
    await expect(page.getByRole("listitem")).toContainText(/1\.\s*Anna/);

    await page.getByRole("button", { name: "Play again" }).click();
    await expect(page.getByRole("heading", { name: "Game over" })).toBeHidden();
    await expect(cell(page, "Anna", "Ones")).toHaveText("–");
  });

  test("new game asks for confirmation, then returns to setup", async ({ page }) => {
    await startGame(page, ["Anna", "Bo"]);
    await page.getByRole("button", { name: "New game" }).click();
    await page.getByRole("button", { name: "End game?" }).click();
    await expect(page.getByRole("heading", { name: "New game" })).toBeVisible();
  });
});
