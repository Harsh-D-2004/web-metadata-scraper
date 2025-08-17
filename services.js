import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import * as fs from "fs";

export async function getMetadata(url) {
    try{
        const refinedUrl = refineUrl(url);
        if (!refinedUrl) {
            return { brand_name: "Unknown", description: "Unknown" };
        }
        const data = await scrape(refinedUrl);
        if(!data) {
            return { brand_name: "Unknown", description: "Unknown" };
        }
        const metadata = await refineData(preprocessText(data));
        if(!metadata) {
            return { brand_name: "Unknown", description: "Unknown" };
        }
        return metadata;
    } catch (error) {
        console.error("Error getting metadata:", error.message);
        return { brand_name: "Unknown", description: "Unknown" };
    }
}

async function scrape(url) {
  let combinedText = "";

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
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
    console.error("Scrape error:", err.message);
    return null;
  }
}

function preprocessText(text) {
  if (!text) return "";

  let cleanedText = text
    .replace(/<[^>]+>/g, "")              // for  HTML tags
    .replace(/&nbsp;/gi, " ")             // for  non-breaking spaces
    .replace(/\s+/g, " ")                 // for  multiple spaces
    .trim();

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
    console.error("Invalid URL:", url);
    return null;
  }
}


async function refineData(context) {
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
    } catch (e) {
      console.error("Failed to parse JSON:", output);
      parsed = { brand_name: "Unknown", description: "Unknown" };
    }

    return parsed;
  } catch (error) {
    console.error(
      "Error refining data:",
      error.response?.data || error.message
    );
    return { brand_name: "Unknown", description: "Unknown" };
  }
}
