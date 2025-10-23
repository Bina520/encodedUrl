
import { NextResponse } from "next/server";

const rootDomain = "xbling.vercel.app";

export async function GET(req) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (key !== process.env.MY_SECRET_KEY)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const action = url.searchParams.get("action") || "create";
  const token = process.env.VERCEL_TOKEN;
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID;
  const project = process.env.VERCEL_PROJECT;

  if (!token || !deploymentId || !project)
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });

  try {
    if (action === "create") {
      let alias = url.searchParams.get("alias");
      if (!alias) alias = Math.random().toString(36).substring(2, 8);

      const res = await fetch("https://api.vercel.com/v2/aliases", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ deploymentId, alias: `${alias}.${rootDomain}` }),
      });
      const data = await res.json();
      if (!res.ok) return NextResponse.json({ error: "Vercel API failed", details: data }, { status: 500 });

      return NextResponse.json({
        success: true,
        alias: `${alias}.${rootDomain}`,
        url: `https://${alias}.${rootDomain}`,
        uid: data.uid,
        createdAt: new Date().toISOString(),
      });
    }

    if (action === "list") {
      const res = await fetch(`https://api.vercel.com/v2/aliases?projectId=${project}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const aliases = (data.aliases || []).map(a => ({
        alias: a.alias,
        url: `https://${a.alias}`,
        uid: a.uid,
        createdAt: a.createdAt || new Date().toISOString()
      }));
      return NextResponse.json({ success: true, aliases });
    }

    if (action === "delete") {
      const uid = url.searchParams.get("uid");
      if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });
      const res = await fetch(`https://api.vercel.com/v2/aliases/${uid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return NextResponse.json({ error: "Delete failed", details: data }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch(err) {
    return NextResponse.json({ error: "Internal error", details: err.message }, { status: 500 });
  }
}
