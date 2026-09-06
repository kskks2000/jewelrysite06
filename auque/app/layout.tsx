import type { Metadata } from 'next';
import { Cormorant_Garamond, Noto_Sans_KR } from 'next/font/google';
import './globals.css';
const serif = Cormorant_Garamond({ variable: '--font-editorial', subsets: ['latin'], weight: ['300', '400', '500'], style: ['normal', 'italic'], display: 'swap' });
const sans = Noto_Sans_KR({ variable: '--font-body', subsets: ['latin'], weight: ['300', '400', '500'], display: 'swap' });
export const metadata: Metadata = {
  metadataBase: new URL('https://auque-maison.metacode10.chatgpt.site'),
  title: 'AUQUE — The Art of Desire',
  description: '예술적 관능, 당신만의 찬란함. AUQUE의 하이 주얼리, 타임피스, 향수 콘셉트 컬렉션과 프라이빗 크리에이션을 만나보세요.',
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body className={`${serif.variable} ${sans.variable}`}>{children}</body></html>;
}
