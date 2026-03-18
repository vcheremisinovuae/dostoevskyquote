export default async function handler(req, res) {
  try {
    const response = await fetch("https://www.rbc.ru/", {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch RBC homepage" });
    }

    const html = await response.text();

    const matches = [...html.matchAll(/<a[^>]+href="(https:\/\/www\.rbc\.ru\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];

    const cleaned = matches
      .map((match) => {
        const link = match[1];
        const rawTitle = match[2]
          .replace(/<[^>]+>/g, " ")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/\s+/g, " ")
          .trim();

        return {
          title: rawTitle,
          link
        };
      })
      .filter((item) =>
        item.title &&
        item.title.length > 25 &&
        !item.title.includes("Подписка") &&
        !item.title.includes("РБК") &&
        !item.link.includes("/tags") &&
        !item.link.includes("/search") &&
        !item.link.includes("/short_news")
      );

    const unique = [];
    const seen = new Set();

    for (const item of cleaned) {
      const key = `${item.title}|${item.link}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
      if (unique.length >= 10) break;
    }

    res.status(200).json(unique);
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
