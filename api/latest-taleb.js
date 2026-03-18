export default async function handler(req, res) {
  try {
    const bearerToken = process.env.X_BEARER_TOKEN;
    const userId = process.env.X_USER_ID;

    if (!bearerToken || !userId) {
      return res.status(500).json({
        error: "Missing X_BEARER_TOKEN or X_USER_ID"
      });
    }

    const apiRes = await fetch(
      `https://api.x.com/2/users/${userId}/tweets?max_results=5&exclude=replies,retweets&tweet.fields=created_at`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`
        }
      }
    );

    if (!apiRes.ok) {
      const text = await apiRes.text();
      return res.status(apiRes.status).json({ error: text });
    }

    const json = await apiRes.json();
    const tweet = json?.data?.[0];

    if (!tweet) {
      return res.status(200).json({
        text: "No recent post found."
      });
    }

    return res.status(200).json({
      text: tweet.text,
      created_at: tweet.created_at,
      url: `https://x.com/nntaleb/status/${tweet.id}`
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
