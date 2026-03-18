export default async function handler(req, res) {
  try {
    const bearerToken = process.env.X_BEARER_TOKEN;
    const username = "nntaleb";

    if (!bearerToken) {
      return res.status(500).json({
        error: "Missing X_BEARER_TOKEN"
      });
    }

    const userRes = await fetch(
      `https://api.x.com/2/users/by/username/${username}`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`
        }
      }
    );

    const userText = await userRes.text();

    if (!userRes.ok) {
      return res.status(userRes.status).json({
        error: "Failed to look up user",
        details: userText
      });
    }

    const userJson = JSON.parse(userText);
    const userId = userJson?.data?.id;

    if (!userId) {
      return res.status(404).json({
        error: "Could not find user ID for nntaleb"
      });
    }

    const tweetsRes = await fetch(
      `https://api.x.com/2/users/${userId}/tweets?max_results=5&exclude=replies,retweets&tweet.fields=created_at`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`
        }
      }
    );

    const tweetsText = await tweetsRes.text();

    if (!tweetsRes.ok) {
      return res.status(tweetsRes.status).json({
        error: "Failed to fetch tweets",
        details: tweetsText
      });
    }

    const tweetsJson = JSON.parse(tweetsText);
    const tweet = tweetsJson?.data?.[0];

    if (!tweet) {
      return res.status(200).json({
        text: "No recent post found."
      });
    }

    return res.status(200).json({
      text: tweet.text,
      created_at: tweet.created_at,
      url: `https://x.com/${username}/status/${tweet.id}`
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
