export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = req.query.key;
  if (key !== process.env.MY_SECRET_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const randomAlias = Math.random().toString(36).substring(2, 8);
  const rootDomain = "xbling.vercel.app";
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID;
  const token = process.env.VERCEL_TOKEN;

  if (!token || !deploymentId) {
    return res.status(500).json({ error: "Missing env vars" });
  }

  try {
    const response = await fetch("https://api.vercel.com/v2/aliases", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deploymentId,
        alias: `${randomAlias}.${rootDomain}`,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      res.status(200).json({
        success: true,
        alias: `${randomAlias}.${rootDomain}`,
        url: `https://${randomAlias}.${rootDomain}`,
        createdAt: new Date().toISOString(),
      });
    } else {
      res.status(500).json({ error: "Vercel API failed", details: data });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal error", details: err.message });
  }
}
