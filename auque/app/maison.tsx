'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, Check, Menu, Play, X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { collection, type Creation } from '@/lib/collection';

function CloseButton() {
  return <DialogClose className="dialog-close" aria-label="닫기"><X size={20} strokeWidth={1.2} /></DialogClose>;
}

export default function Maison() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [creation, setCreation] = useState<Creation | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState('consultation');
  const [interest, setInterest] = useState('general');
  const [filmOpen, setFilmOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  function openInquiry(type = 'consultation', product = 'general') {
    setCreation(null); setInquiryType(type); setInterest(product); setStatus('idle'); setError(''); setConsent(false); setInquiryOpen(true);
  }

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: Record<string, unknown>, options: { signal: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try { void Promise.resolve(context.registerTool({ name: 'open_auque_creation', title: 'Explore an AUQUE creation', description: 'Open the detail view of an AUQUE concept creation. This does not submit a consultation request.', annotations: { readOnlyHint: false, untrustedContentHint: false }, inputSchema: { type: 'object', properties: { creation: { type: 'string', enum: ['jewelry', 'timepieces', 'parfum'] } }, required: ['creation'], additionalProperties: false }, execute: async (args: unknown) => {
      if (!args || typeof args !== 'object' || !('creation' in args) || typeof args.creation !== 'string') throw new Error('A valid creation is required');
      const selected = collection.find(item => item.id === args.creation);
      if (!selected) throw new Error('Unknown creation');
      setCreation(selected);
      return { content: [{ type: 'text', text: JSON.stringify({ name: selected.name, description: selected.description, material: selected.material, status: 'concept', availability: 'private consultation' }) }] };
    } }, { signal: lifecycle.signal })).catch(() => { /* Optional browser capability. */ }); } catch { /* Browsers without support still use the same visible controls. */ }
    return () => lifecycle.abort();
  }, []);

  async function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;
    if (!consent) { setError('상담을 위한 개인정보 이용에 동의해 주세요.'); setStatus('error'); return; }
    const form = new FormData(event.currentTarget);
    setStatus('sending'); setError('');
    try {
      const result = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.get('name'), email: form.get('email'), preferredDate: form.get('preferredDate'), message: form.get('message'), type: inquiryType, interest, consent }) });
      const data = await result.json() as { error?: string; reference?: string };
      if (!result.ok) throw new Error(data.error || '요청을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      if (!data.reference) throw new Error('접수 결과를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      setReference(data.reference); setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : '연결을 확인한 후 다시 시도해 주세요.'); setStatus('error');
    }
  }

  return <>
    <a className="skip-link" href="#collections">컬렉션으로 바로가기</a>
    <header id="top">
      <div className="masthead">
        <span className="masthead-note eyebrow">A WORLD BEYOND THE ORDINARY</span>
        <button className="mobile-menu" aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={23} strokeWidth={1} /> : <Menu size={23} strokeWidth={1} />}</button>
        <a className="wordmark" href="#top" aria-label="AUQUE 홈">AUQUE</a>
        <button className="concierge-link" onClick={() => openInquiry()}>프라이빗 상담 <ArrowUpRight size={16} strokeWidth={1} /></button>
      </div>
      <nav id="main-navigation" className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="주 메뉴">
        {[['하이 주얼리', '#jewelry'], ['타임피스', '#timepieces'], ['향수', '#parfum'], ['메종 AUQUE', '#maison'], ['프라이빗 크리에이션', '#bespoke']].map(([label, href]) => <a href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
      </nav>
    </header>

    <main>
      <section className="hero" aria-labelledby="hero-title">
        <img className="hero-image" src="/images/palace-muse.webp" alt="빛이 쏟아지는 궁전에서 크라운 모티프 다이아몬드 네크리스와 아이보리 드레스를 착용한 AUQUE의 한국인 성인 뮤즈" fetchPriority="high" width={1672} height={941} />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">AUQUE · THE FIRST CHAPTER</p>
          <h1 id="hero-title">The art<br />of <em>desire.</em></h1>
          <p className="hero-description">감히 꿈꾸는 것. 끝내 나의 것이 되는 것.<br />예술적 관능, AUQUE.</p>
          <a href="#collections" className="line-link">첫 번째 컬렉션 감상하기 <ArrowRight size={22} strokeWidth={1} /></a>
        </div>
        <div className="hero-bottom">
          <div className="hero-index">01 <span /> PREMIÈRE</div>
          <button className="film-button" onClick={() => setFilmOpen(true)}><span className="play-small"><Play size={11} fill="currentColor" strokeWidth={0} /></span>브랜드 필름 보기</button>
        </div>
      </section>

      <section className="intro" aria-labelledby="intro-title">
        <p className="eyebrow">THE ESSENCE OF AUQUE</p>
        <h2 id="intro-title">Some things are meant to be desired.</h2>
        <p>어떤 아름다움은, 바라보는 순간부터 당신의 이야기가 됩니다.<br />빛과 시간, 향으로 쓰는 AUQUE의 첫 번째 장.</p>
      </section>

      <section className="collections" id="collections" aria-labelledby="collection-title">
        <div className="section-heading"><div><p className="eyebrow">THREE EXPRESSIONS. ONE DESIRE.</p><h2 id="collection-title">The Collections</h2></div><p>세 가지 세계, 하나의 AUQUE</p></div>
        <div className="collection-grid">
          {collection.map(item => <article className="collection-card" id={item.id} key={item.id}>
            <button className="product-image-button" aria-label={`${item.korean} — ${item.name} 작품 상세 보기`} onClick={() => setCreation(item)}>
              <img src={item.image} alt={item.alt} loading="lazy" width={1024} height={1280} />
              <span className="product-index">{item.number} / AUQUE</span><span className="product-view"><ArrowUpRight size={20} strokeWidth={1} /></span>
            </button>
            <div className="product-info"><div><span className="eyebrow">{item.category}</span><h3>{item.name}</h3></div><span>{item.korean}</span></div>
          </article>)}
        </div>
      </section>

      <section className="maison-section" id="maison" aria-labelledby="maison-title">
        <div className="maison-image"><img src="/images/palace-muse.webp" alt="찬란한 궁전과 AUQUE의 뮤즈" loading="lazy" width={1672} height={941} /><span className="maison-image-caption eyebrow">THE MUSE. THE PALACE. THE DESIRE.</span></div>
        <div className="maison-copy"><p className="eyebrow">INSIDE THE MAISON</p><h2 id="maison-title">Born of art.<br /><em>Made for desire.</em></h2><p className="body-copy">AUQUE는 아름다움을 향한 대담한 욕망에서 시작합니다. 궁전의 웅장한 선, 왕관의 빛, 그리고 그 모든 것을 자신의 것으로 만드는 한 사람.</p><p className="body-copy">우리에게 관능은 드러냄보다 깊은 존재감입니다. 시선을 붙잡는 순간을 넘어, 오래도록 마음에 남는 작품을 꿈꿉니다.</p><button className="line-link" onClick={() => setFilmOpen(true)}>AUQUE의 세계로 <Play size={15} strokeWidth={1} /></button></div>
      </section>

      <section className="bespoke" id="bespoke" aria-labelledby="bespoke-title">
        <div className="edition" aria-label="오직 한 사람을 위한 작품">01 / 01<small>EXCLUSIVELY YOURS</small></div>
        <div><p className="eyebrow">PRIVATE CREATIONS</p><h2 id="bespoke-title">Only you. Only AUQUE.</h2><p>한정된 작품, 무한한 당신의 취향.<br />오직 한 사람을 위한 크리에이션을 함께 구상합니다.</p></div>
        <button className="line-link" onClick={() => openInquiry('bespoke')}>맞춤 제작 문의 <ArrowRight size={22} strokeWidth={1} /></button>
      </section>
    </main>

    <footer><div className="footer-top"><p>HAUTE JOAILLERIE · TIMEPIECES · PARFUM</p><div className="footer-links"><a href="#maison">메종 AUQUE</a><button onClick={() => openInquiry()}>프라이빗 상담</button><button onClick={() => setPrivacyOpen(true)}>개인정보 안내</button></div></div><div className="footer-mark" aria-hidden="true">AUQUE</div><div className="footer-bottom"><span>© {new Date().getFullYear()} AUQUE. The art of desire.</span><span>본 컬렉션은 콘셉트 작품입니다. 제작 사양과 가격은 개별 상담 후 제안됩니다.</span></div></footer>

    <Dialog open={!!creation} onOpenChange={(open) => { if (!open) setCreation(null); }}>
      <DialogContent className="auque-dialog" showCloseButton={false}><CloseButton />{creation && <div className="product-detail"><img src={creation.image} alt={creation.alt} /><div className="product-detail-copy"><span className="eyebrow">{creation.category}</span><DialogTitle>{creation.name}</DialogTitle><DialogDescription>{creation.description}</DialogDescription><dl className="product-spec"><div><dt>디자인</dt><dd>{creation.detail}</dd></div><div><dt>소재 구상</dt><dd>{creation.material}</dd></div><div><dt>에디션</dt><dd>한정 · 맞춤 제작 구상</dd></div><div><dt>가격</dt><dd>프라이빗 상담</dd></div></dl><p className="form-note">콘셉트 작품 · {creation.note}</p><button className="line-link" onClick={() => openInquiry('bespoke', creation.id)}>이 작품으로 상담하기 <ArrowRight size={19} strokeWidth={1} /></button></div></div>}</DialogContent>
    </Dialog>

    <Dialog open={inquiryOpen} onOpenChange={(open) => { if (status !== 'sending') setInquiryOpen(open); }}>
      <DialogContent className="auque-dialog inquiry-dialog" showCloseButton={false}><CloseButton /><p className="eyebrow">A PERSONAL INVITATION</p><DialogTitle>Private Appointment</DialogTitle>
        {status === 'success' ? <div className="success-panel" role="status"><Check size={40} strokeWidth={1} /><DialogDescription>상담 요청이 저장되었습니다.<br />희망 일정은 아직 확정되지 않았습니다.</DialogDescription><strong>접수 번호 · {reference}</strong><p>요청 내용을 바탕으로 개별 상담을 준비합니다.</p><DialogClose className="line-link">컬렉션으로 돌아가기 <ArrowRight size={19} /></DialogClose></div> : <>
          <DialogDescription>당신이 그리는 아름다움을 들려주세요.<br />프라이빗 상담 또는 맞춤 제작에 대한 요청을 남기실 수 있습니다.</DialogDescription>
          <form className="inquiry-form" onSubmit={submitInquiry}>
            <div className="form-row"><label className="form-field">성함<input name="name" autoComplete="name" required maxLength={80} placeholder="성함을 입력해 주세요" /></label><label className="form-field">이메일<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></label></div>
            <div className="form-row"><div className="form-field"><label id="inquiry-type-label">문의 유형</label><Select value={inquiryType} onValueChange={(v) => v && setInquiryType(v)} items={[{ value: 'consultation', label: '프라이빗 상담' }, { value: 'bespoke', label: '맞춤 제작 문의' }]}><SelectTrigger className="form-select" aria-labelledby="inquiry-type-label"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="consultation">프라이빗 상담</SelectItem><SelectItem value="bespoke">맞춤 제작 문의</SelectItem></SelectContent></Select></div><div className="form-field"><label id="interest-label">관심 컬렉션</label><Select value={interest} onValueChange={(v) => v && setInterest(v)} items={[{ value: 'general', label: '컬렉션 전체' }, ...collection.map(p => ({ value: p.id, label: p.korean }))]}><SelectTrigger className="form-select" aria-labelledby="interest-label"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="general">컬렉션 전체</SelectItem>{collection.map(p => <SelectItem value={p.id} key={p.id}>{p.korean}</SelectItem>)}</SelectContent></Select></div></div>
            <label className="form-field">희망 상담일 (선택)<input name="preferredDate" type="date" min={new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10)} /></label>
            <label className="form-field">나누고 싶은 이야기 (선택)<textarea name="message" maxLength={2000} placeholder="관심 작품, 맞춤 제작 아이디어 또는 원하시는 상담 내용을 알려주세요." rows={3} /></label>
            <label className="consent-label"><Checkbox checked={consent} onCheckedChange={setConsent} aria-label="상담 요청 처리를 위한 개인정보 이용 동의" /><span>상담 요청 처리를 위한 성함, 이메일 및 입력 내용의 저장·이용에 동의합니다. (필수)</span></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" className="submit-button" disabled={status === 'sending'}>{status === 'sending' ? '요청을 저장하고 있습니다…' : '상담 요청 남기기'}<ArrowRight size={22} strokeWidth={1} /></button>
            <p className="form-note">요청은 이 사이트에 저장되며 이메일은 자동 발송되지 않습니다. 일정과 제작 가능 여부는 별도 협의 후 확정됩니다.</p>
          </form>
        </>}
      </DialogContent>
    </Dialog>

    <Dialog open={filmOpen} onOpenChange={setFilmOpen}><DialogContent className="film-dialog" showCloseButton={false}><CloseButton />{filmOpen && <video src="/films/auque-desire.mp4" poster="/images/palace-muse.webp" controls autoPlay muted playsInline preload="metadata" aria-label="AUQUE The Art of Desire, 무음 브랜드 무드 필름" />}<div className="film-caption"><DialogTitle>The Art of Desire</DialogTitle><DialogDescription>AUQUE · PREMIÈRE — 이미지로 펼치는 무음 무드 필름</DialogDescription></div></DialogContent></Dialog>

    <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}><DialogContent className="auque-dialog inquiry-dialog" showCloseButton={false}><CloseButton /><p className="eyebrow">YOUR PRIVACY</p><DialogTitle>개인정보 안내</DialogTitle><DialogDescription>상담 요청을 남기기 전에 확인해 주세요.</DialogDescription><div className="privacy-copy"><p>상담 요청 시 성함과 이메일을 필수로 저장하며, 희망 상담일과 메시지는 선택적으로 입력할 수 있습니다. 입력 내용은 요청 확인과 개별 상담 준비에 사용됩니다.</p><p>입력 내용은 사이트의 상담 기록으로 저장됩니다. 자동 이메일 발송이나 외부 마케팅 서비스 연동은 사용하지 않습니다.</p><p>개인정보 이용에 동의하지 않으면 상담 요청을 제출할 수 없습니다. 컬렉션과 브랜드 이야기는 동의 없이 감상할 수 있습니다.</p></div></DialogContent></Dialog>
  </>;
}

