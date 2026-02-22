import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function toIso(v) {
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const raw = fs.readFileSync("./legacy.json", "utf8");
const items = JSON.parse(raw); // [{ id, title, content, date, ... }]

for (const it of items) {
  const title = String(it.title ?? "").trim();
  const content = String(it.content ?? "").trim();
  const source_id = String(it.id ?? "").trim();
  const source_date = toIso(it.date);

  if (!title || !content || !source_id || !source_date) continue;

  // 1) title+content로 찾기 (너 글은 길어서 이게 꽤 잘 맞음)
  const { data: found, error: qerr } = await supabase
    .from("shiori_items")
    .select("id")
    .eq("title", title)
    .eq("content", content)
    .limit(1);

  if (qerr) {
    console.error("query error", qerr);
    continue;
  }

  if (!found || found.length === 0) {
    console.log("NOT FOUND:", title);
    continue;
  }

  const rowId = found[0].id;

  // 2) source_id/source_date 채우기 + created_at 보정 시도
  const { error: uerr } = await supabase
    .from("shiori_items")
    .update({
      source_id,
      source_date,
      created_at: source_date, // ✅ 이게 막히면 source_date만이라도 채워짐
      updated_at: new Date().toISOString(),
    })
    .eq("id", rowId);

  if (uerr) {
    console.error("update error", title, uerr);
  } else {
    console.log("OK:", title);
  }
}

console.log("done");
