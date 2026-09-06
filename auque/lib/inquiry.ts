export type Inquiry = { name: string; email: string; type: 'consultation' | 'bespoke'; interest: string; preferredDate: string; message: string; consent: true };
export function validateInquiry(input: unknown, today = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10)): Inquiry {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('입력 내용을 확인해 주세요.');
  const data = input as Record<string, unknown>;
  const text = (key: string, max: number) => {
    if (typeof data[key] !== 'string') throw new Error('입력 내용을 확인해 주세요.');
    const value = (data[key] as string).trim();
    if (value.length > max) throw new Error('입력 내용이 너무 깁니다.');
    return value;
  };
  const name = text('name', 80), email = text('email', 254), message = text('message', 2000), preferredDate = text('preferredDate', 10);
  if (!name) throw new Error('성함을 입력해 주세요.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('이메일 주소를 확인해 주세요.');
  if (!['consultation', 'bespoke'].includes(String(data.type))) throw new Error('문의 유형을 선택해 주세요.');
  if (!['general', 'jewelry', 'timepieces', 'parfum'].includes(String(data.interest))) throw new Error('관심 컬렉션을 선택해 주세요.');
  if (data.consent !== true) throw new Error('개인정보 이용에 동의해 주세요.');
  if (preferredDate && (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) || !Number.isFinite(Date.parse(preferredDate)) || new Date(preferredDate).toISOString().slice(0, 10) !== preferredDate || preferredDate < today)) throw new Error('희망 상담일을 확인해 주세요.');
  return { name, email, type: data.type as Inquiry['type'], interest: String(data.interest), preferredDate, message, consent: true };
}
