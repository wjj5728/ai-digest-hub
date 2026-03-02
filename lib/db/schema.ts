export const schemaNotes = {
  tables: [
    "sources(id, name, url, enabled)",
    "raw_items(id, source_id, title, url, published_at, content, hash)",
    "daily_digest(id, digest_date, title, body_md, body_text)",
    "delivery_logs(id, digest_id, channel, status, detail, created_at)"
  ]
};
