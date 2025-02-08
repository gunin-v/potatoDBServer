import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";

chromium.use(stealth());

export const configureParser = async () => {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, как Gecko) Chrome/114.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
    javaScriptEnabled: true,
  });
  const page = await context.newPage();
  await page.setExtraHTTPHeaders({
    "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
  });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.mouse.move(100, 200);

  return { browser, page };
};
