
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const randomAlias = Math.random().toString(36).substring(2, 8);
  const rootDomain = process.env.ROOT_DOMAIN || 'xbling.vercel.app';

  const aliasUrl = `https://${randomAlias}.${rootDomain}`;
  res.status(200).json({
    success: true,
    alias: `${randomAlias}.${rootDomain}`,
    url: aliasUrl
  });
}
