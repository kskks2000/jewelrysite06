import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateInquiry } from '../lib/inquiry.ts';

const valid = { name: ' 테스트 ', email: 'test@example.com', type: 'bespoke', interest: 'jewelry', preferredDate: '2026-09-10', message: '디자인 상담', consent: true };
test('accepts a bespoke request and trims surrounding whitespace', () => {
  assert.equal(validateInquiry(valid, '2026-09-05').name, '테스트');
});
test('allows omitted optional appointment date and message as empty strings', () => {
  assert.equal(validateInquiry({ ...valid, preferredDate: '', message: '' }, '2026-09-05').preferredDate, '');
});
test('rejects absent consent, invalid email, unknown collections and excessive data', () => {
  for (const patch of [{ consent: false }, { email: 'bad-email' }, { interest: 'unknown' }, { type: 'unknown' }, { name: '' }, { message: 'x'.repeat(2001) }]) {
    assert.throws(() => validateInquiry({ ...valid, ...patch }, '2026-09-05'));
  }
});
test('rejects past dates and impossible calendar dates, permits today in Seoul', () => {
  for (const date of ['2026-09-04', '2026-02-30', 'invalid', '2026-13-01']) assert.throws(() => validateInquiry({ ...valid, preferredDate: date }, '2026-09-05'));
  assert.equal(validateInquiry({ ...valid, preferredDate: '2026-09-05' }, '2026-09-05').preferredDate, '2026-09-05');
});
test('rejects malformed payloads and nonstring personal data', () => {
  for (const data of [null, [], 'text', { ...valid, name: { value: 'test' } }, { ...valid, email: null }]) assert.throws(() => validateInquiry(data, '2026-09-05'));
});
