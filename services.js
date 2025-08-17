import axios from "axios";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import * as fs from "fs";

export async function getMetadata(url) {
  console.log(`[getMetadata] Starting for URL: ${url}`);
  try {
    const refinedUrl = refineUrl(url);
    if (!refinedUrl) {
      console.warn("[getMetadata] Invalid URL");
      return { brand_name: "Unknown", description: "Unknown" };
    }

    console.log(`[getMetadata] Refined URL: ${refinedUrl}`);
    const data = await scrape(refinedUrl);

    if (!data) {
      console.warn("[getMetadata] No data scraped");
      return { brand_name: "Unknown", description: "Unknown" };
    }

    const metadata = await refineData(preprocessText(data));

    if (!metadata) {
      console.warn("[getMetadata] Metadata missing");
      return { brand_name: "Unknown", description: "Unknown" };
    }

    console.log(`[getMetadata] Success for ${refinedUrl}`);
    return metadata;
  } catch (error) {
    console.error("[getMetadata] Error:", error.message);
    return { brand_name: "Unknown", description: "Unknown" };
  }
}

async function scrape(url) {
  console.log(`[scrape] Visiting: ${url}`);
  let combinedText = "";

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });

    const bodyText = await page.evaluate(() =>
      document.body.innerText.replace(/\s+/g, " ").trim()
    );

    combinedText += " " + bodyText;
    await browser.close();
    return combinedText;
  } catch (err) {
    console.error("[scrape] Error:", err.message);
    return null;
  }
}

function preprocessText(text) {
  if (!text) return "";
  let cleanedText = text
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  console.log(`[preprocessText] Cleaned length: ${cleanedText.length}`);
  return cleanedText;
}

function refineUrl(url) {
  if (!url) return null;

  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  try {
    const parsed = new URL(url);
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    return parsed.toString();
  } catch (err) {
    console.error("[refineUrl] Invalid URL:", url);
    return null;
  }
}

async function refineData(context) {
  console.log("[refineData] Sending context to model...");
  const promptTemplate = fs.readFileSync("./prompt.txt", "utf8");
  const prompt = promptTemplate.replace("${context}", context);

  try {
    const data = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const url = process.env.GEMINI_URL;

    const res = await axios.post(url, data, config);

    let output = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    output = output.replace(/```json|```/gi, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(output);
      console.log("[refineData] Parsed successfully");
    } catch (e) {
      console.error("[refineData] Failed to parse JSON:", output);
      parsed = { brand_name: "Unknown", description: "Unknown" };
    }

    return parsed;
  } catch (error) {
    console.error("[refineData] Error:", error.response?.data || error.message);
    return { brand_name: "Unknown", description: "Unknown" };
  }
}
