export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID; // 🧩 Project ID (prj_xxxxx)
  const rootDomain = "xbling.vercel.app";

  if (!token || !projectId) {
    return res.status(500).json({
      error: "Missing VERCEL_TOKEN or VERCEL_PROJECT_ID",
    });
  }

  try {
    // 🧠 B1: Lấy deployment mới nhất của project
    const deploymentsRes = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const deployments = await deploymentsRes.json();
    const deploymentId = deployments.deployments?.[0]?.uid;

    if (!deploymentId) {
      throw new Error("No deployments found for this project");
    }

    // 🧠 B2: Sinh alias ngẫu nhiên
    const randomAlias = Math.random().toString(36).substring(2, 8);
    const alias = `${randomAlias}.${rootDomain}`;

    // 🧠 B3: Gắn alias vào deployment hiện tại
    const aliasRes = await fetch(`https://api.vercel.com/v2/aliases`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deploymentId,
        alias,
      }),
    });

    const aliasData = await aliasRes.json();

    if (!aliasRes.ok) {
      return res.status(500).json({
        error: "Failed to create alias",
        details: aliasData,
      });
    }

    // ✅ Thành công
    res.status(
