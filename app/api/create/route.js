const ROOT_DOMAIN = "xbling.vercel.app";
let aliasStore = []; // lưu alias tạm thời trong memory

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const alias = searchParams.get("alias");
  const key = searchParams.get("key");

  if (key !== process.env.MY_SECRET_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  if (action === "create") {
    const random = alias || Math.random().toString(36).substring(2, 8);
    const newAlias = `${random}.${ROOT_DOMAIN}`;
    const createdAt = new Date().toISOString();
    const id = random;

    aliasStore.push({ id, alias: newAlias, createdAt });
    return new Response(JSON.stringify({ success: true, alias: newAlias, createdAt }), { status: 200 });
  }

  if (action === "list") {
    return new Response(JSON.stringify(aliasStore), { status: 200 });
  }

  if (action === "delete") {
    const idx = aliasStore.findIndex(a => a.id === alias);
    if (idx !== -1) aliasStore.splice(idx, 1);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });
}
