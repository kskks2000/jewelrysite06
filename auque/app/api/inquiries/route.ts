import { saveInquiry } from '@/db/inquiries';
import { validateInquiry } from '@/lib/inquiry';

export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: '허용되지 않은 요청입니다.' }, { status: 403, headers });
  if (!request.headers.get('content-type')?.includes('application/json')) return Response.json({ error: '요청 형식을 확인해 주세요.' }, { status: 415, headers });
  let data;
  try {
    if (Number(request.headers.get('content-length')) > 16384) return Response.json({ error: '요청 내용이 너무 깁니다.' }, { status: 413, headers });
    const body = await request.text();
    if (new TextEncoder().encode(body).length > 16384) return Response.json({ error: '요청 내용이 너무 깁니다.' }, { status: 413, headers });
    data = validateInquiry(JSON.parse(body));
  } catch (error) {
    return Response.json({ error: error instanceof SyntaxError ? '입력 내용을 확인해 주세요.' : error instanceof Error ? error.message : '입력 내용을 확인해 주세요.' }, { status: 400, headers });
  }
  try {
    const id = await saveInquiry(data);
    return Response.json({ reference: `AUQUE-${id.slice(0, 8).toUpperCase()}` }, { status: 201, headers });
  } catch {
    return Response.json({ error: '현재 요청을 저장할 수 없습니다. 잠시 후 다시 시도해 주세요.' }, { status: 503, headers });
  }
}
