import express from "express";
import Groq from "groq-sdk";
import axios from "axios";
import * as cheerio from "cheerio";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROK_API });

/**
 * Enhanced Search: Captures snippets for fallback
 */
const getLinksFromSerper = async (query) => {
  try {
    const response = await axios.post(
      "https://google.serper.dev/search",
      { q: query, num: 5 },
      {
        headers: {
          "X-API-KEY": process.env.SERPER_API,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.data.organic) return { links: [], snippets: "" };

    // Combine snippets to ensure Llama has at least SOME context if scraping fails
    const snippets = response.data.organic
      .map((r) => `${r.title}: ${r.snippet}`)
      .join("\n");
    const links = response.data.organic.map((result) => result.link);

    return { links, snippets };
  } catch (error) {
    console.error("Serper Error:", error.message);
    return { links: [], snippets: "" };
  }
};

/**
 * Quality Check: Detects if we scraped a "Blocker" page
 */
const isQualityText = (text) => {
  const garbageTerms = [
    "captcha",
    "enable javascript",
    "access denied",
    "403 forbidden",
    "cloudflare",
    "security check",
  ];
  const isTooShort = text.length < 300;
  const containsGarbage = garbageTerms.some((term) =>
    text.toLowerCase().includes(term),
  );
  return !isTooShort && !containsGarbage;
};

const refineWithGroq = async (rawText, userQuery, fallbackSnippets) => {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert researcher. Use the provided text to answer the query. If the text is insufficient, use the provided snippets. Be factual and succinct.",
        },
        {
          role: "user",
          content: `Query: ${userQuery}\n\nPrimary Text: ${rawText.substring(0, 15000)}\n\nBackup Snippets: ${fallbackSnippets}`,
        },
      ],
      temperature: 0.1,
    });
    return completion.choices[0]?.message?.content;
  } catch (error) {
    return "Refinement failed.";
  }
};

router.get("/scrape", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).send("Query required");

  try {
    const { links, snippets } = await getLinksFromSerper(query);
    if (links.length === 0) return res.status(500).send("No results found.");

    // Scrape all links in parallel
    const scrapeTasks = links.map(async (url) => {
      try {
        const resp = await axios.get(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
          },
          timeout: 6000,
        });
        const $ = cheerio.load(resp.data);
        $("script, style, nav, footer, header, noscript").remove();
        const text = $("body").text().replace(/\s+/g, " ").trim();

        if (!isQualityText(text)) return null;
        return text;
      } catch (e) {
        return null;
      }
    });

    const scrapedResults = await Promise.all(scrapeTasks);
    // Filter out nulls and combine the top 2 best sources
    const validContext = scrapedResults
      .filter(Boolean)
      .slice(0, 2)
      .join("\n---\n");

    const answer = await refineWithGroq(validContext, query, snippets);

    res.json({
      query,
      answer,
      method: validContext ? "Full Web Scrape" : "Snippet Fallback",
    });
  } catch (error) {
    res.status(500).json({ error: "Internal processing error" });
  }
});
/**
 * POST /summarize
 * Body: { text: "...", mode: "bullets" | "narrative" | "facts" }
 */
router.post("/summarize", async (req, res) => {
  const { text, mode } = req.body;

  // 1. Validation: Don't waste API tokens on empty or tiny selections
  if (!text || text.length < 50) {
    return res.status(400).json({ error: "Selection too short to summarize." });
  }

  const prompts = {
    bullets: "Summarize into 3-5 high-impact bullet points.",
    narrative: "Summarize into one professional, academic paragraph.",
    facts:
      "Extract only key entities (names, dates, prices, locations). No prose.",
  };

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a professional editor. ${prompts[mode] || prompts.bullets} Start immediately with the summary. No 'Here is...' or 'In conclusion...'`,
        },
        {
          role: "user",
          // Truncate to ~15k words to stay safe within context/latency limits
          content: text.substring(0, 60000),
        },
      ],
      temperature: 0.2, // Lower = more consistent and less "creative" (better for summaries)
    });

    const summary = completion.choices[0]?.message?.content;

    res.json({ summary });
  } catch (error) {
    console.error("Summarization Error:", error.message);
    res.status(500).json({ error: "Failed to generate summary." });
  }
});

export default router;
