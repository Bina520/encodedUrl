import fs from "fs";
import path from "path";

const ROOT_DOMAIN = "xbling.vercel.app";
const DATA_FILE = path.join(process.cwd(), "aliases.json");

function readAliases() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAliases(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const alias = searchParams.get("alias");
  const key = searchParams.get("key");

  if (key !== process.env.MY_SECRET_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let aliases = readAliases();

  if (action === "create") {
    const id = alias || Math.random().toString(36).substring(2, 8);
    const newAlias = `${id}.${ROOT_DOMAIN}`;
    const createdAt = new Date().toISOString();

    aliases.push({ id, alias: newAlias, createdAt, deleted: false });
    writeAliases(aliases);

    return new Response(JSON.stringify({ success: true, alias: newAlias, createdAt }), { status: 200 });
  }

  if (action === "list") {
    return new Response(JSON.stringify(aliases.filter(a => !a.deleted)), { status: 200 });
  }

  if (action === "delete") {
    aliases = aliases.map(a => a.id === alias ? { ...a, deleted: true } : a);
    writeAliases(aliases);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });
}

