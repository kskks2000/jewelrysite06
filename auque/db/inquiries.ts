import { env } from 'cloudflare:workers';
import type { Inquiry } from '@/lib/inquiry';
export async function saveInquiry(data: Inquiry) {
  if (!env.DB) throw new Error('Database unavailable');
  const id = crypto.randomUUID();
  await env.DB.prepare('INSERT INTO inquiries (id, name, email, type, interest, preferred_date, message, consent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, data.name, data.email, data.type, data.interest, data.preferredDate || null, data.message, 1, new Date().toISOString()).run();
  return id;
}
