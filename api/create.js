export default async function handler(req, res) {
  // ✅ Chỉ cho phép phương thức GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ✅ Kiểm tra secret key để tránh spam
  const key = req.query.key;
  if (key !== process.env.MY_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 🔢 Sinh alias ngẫu nhiên 6 ký tự
  const randomAlias = Math.random().toString(36).substring(2, 8);
  const projectName = process.env.VERCEL_PROJECT || "encodedUrl";
  const token = process.env.VERCEL_TOKEN;
  const rootDomain = "xbling.vercel.app";

  if (!token) {
    return res.status(500).json({ error: "Missing VERCEL_TOKEN env variable" });
  }

  try {
    // 🚀 Gọi API Vercel để tạo alias (subdomain)
    const response = await fetch(`https://api.vercel.com/v2/aliases`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
        alias: `${randomAlias}.${rootDomain}`,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      res.status(200).json({
        success: true,
        alias: `${randomAlias}.${rootDomain}`,
        url: `https://${randomAlias}.${rootDomain}`,
      });
    } else {
      res.status(500).json({
        error: "Vercel API failed",
        details: data,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal error",
      details: err.message,
    });
  }
}
