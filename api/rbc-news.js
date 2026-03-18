export default async function handler(req, res) {
  try {
    const response = await fetch("https://rssexport.rbc.ru/rbcnews/news/30/full.rss");
    const xml = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch RBC RSS" });
    }

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .slice(0, 10)
      .map((match) => {
        const item = match[1];

        const getTag = (tag) => {
          const tagMatch = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
          return tagMatch ? tagMatch[1].trim() : "";
        };

        const decode = (text) =>
          text
            .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">");

        return {
          title: decode(getTag("title")),
          link: decode(getTag("link")),
          pubDate: decode(getTag("pubDate"))
        };
      });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
