import type { Inquiry } from '@/lib/inquiry';
export async function saveInquiry(data: Inquiry) {
  const runtime = globalThis as typeof globalThis & { env?: { DB?: D1Database } };
  const db = runtime.env?.DB;
  if (!db) throw new Error('Database unavailable');
  const id = crypto.randomUUID();
  await db.prepare('INSERT INTO inquiries (id, name, email, type, interest, preferred_date, message, consent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, data.name, data.email, data.type, data.interest, data.preferredDate || null, data.message, 1, new Date().toISOString()).run();
  return id;
}
