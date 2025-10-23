export default async function handler(req, res) {
  const token = process.env.VERCEL_TOKEN;
  const project = process.env.VERCEL_PROJECT;
  const key = req.query.key;

  if (key !== process.env.MY_SECRET_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const listRes = await fetch(`https://api.vercel.com/v2/aliases?projectId=${project}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const aliases = await listRes.json();

    if (!aliases.aliases) {
      return res.status(500).json({ error: "No aliases found", details: aliases });
    }

    const now = Date.now();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const deleted = [];

    for (const alias of aliases.aliases) {
      const age = now - new Date(alias.createdAt).getTime();
      if (age > THIRTY_DAYS) {
        await fetch(`https://api.vercel.com/v2/aliases/${alias.uid}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        deleted.push(alias.alias);
      }
    }

    res.status(200).json({
      success: true,
      deletedCount: deleted.length,
      deleted,
    });
  } catch (err) {
    res.status(500).json({ error: "Cleanup failed", details: err.message });
  }
}
