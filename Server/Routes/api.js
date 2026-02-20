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
      model: "llama-3.1-8b-instant",
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

  // 1. Validation
  if (!text || text.length < 50) {
    return res
      .status(400)
      .json({ error: "Selection too short (min 50 chars)." });
  }

  // 2. Ultra-Strict Prompts (Forcing the AI to stop rambling)
  const prompts = {
    bullets:
      "Provide exactly 3 short bullet points. Max 10 words per bullet. Focus on key actions.",
    narrative:
      "Provide exactly ONE short sentence. Maximum 25 words. Capture only the main takeaway.",
    facts:
      "List only the top 5 names, dates, or locations as a comma-separated list. No prose.",
  };

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are a minimalist editor. Your goal is extreme compression. ${prompts[mode] || prompts.bullets} Output ONLY the summary. No introductory remarks, no conversational filler, and no 'Here is a summary'.`,
        },
        {
          role: "user",
          content: text.substring(0, 30000), // Lowered to 30k for faster processing
        },
      ],
      temperature: 0.1, // Near zero for strict adherence to word limits
      max_tokens: 100, // Hard cap on response length to force brevity
    });

    // 3. Robust Response Extraction (Prevents the 500 error if choices is empty)
    const summary = completion.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error("Empty response from AI");
    }

    res.json({ summary });
  } catch (error) {
    console.error("GROQ API ERROR:", error.message);
    res.status(500).json({ error: "Failed to generate summary." });
  }
});
/**
 * POST /expand
 * Body: { text: "...", mode: "bullets" | "narrative" | "facts" }
 */
router.post("/expand", async (req, res) => {
  const { text, mode } = req.body;

  if (!text || text.length < 50) {
    return res.status(400).json({ error: "Selection too short." });
  }
  const prompts = {
    // Adding "Start immediately with '•'" is the only way to kill the intro paragraph
    bullets:
      "Provide exactly 3 bullet points. Each bullet must be a single paragraph of 2-3 sentences. Do not write an introduction or a summary paragraph. Start your response immediately with '•'.",
    narrative:
      "Expand into exactly two detailed paragraphs. Do not rephrase the input. Focus on technical implications and logic. No introductory sentence.",
    facts:
      "List 3 key concepts with a 2-sentence deep-dive for each. Start the list immediately with no header.",
  };

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are a precision editor. ${prompts[mode] || prompts.narrative} 
          CRITICAL: Your output must contain ZERO introductory text. 
          CRITICAL: If your response does not start with the content requested (like a bullet point), it is a failure. 
          Output ONLY the expanded content.`,
        },
        {
          role: "user",
          content: text.substring(0, 30000),
        },
      ],
      temperature: 0.1, // Set to 0.1 to force adherence to the "No Intro" rule
      max_tokens: 500,
    });

    const expandedText = completion.choices?.[0]?.message?.content?.trim();

    if (!expandedText) {
      throw new Error("Empty response from AI");
    }

    res.json({ expandedText });
  } catch (error) {
    console.error("GROQ API ERROR:", error.message);
    res.status(500).json({ error: "Failed to expand text." });
  }
});

export default router;
