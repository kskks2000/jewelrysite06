export const collection = [
  { id: 'jewelry', number: '01', category: 'HAUTE JOAILLERIE', name: 'La Couronne', korean: '하이 주얼리', image: '/images/la-couronne.webp', alt: '크라운의 실루엣을 담은 플래티넘 다이아몬드 네크리스 콘셉트', description: '왕관의 선을 따라 피어나는 빛. 섬세한 다이아몬드의 리듬과 조각적인 실루엣이 목선을 따라 하나의 작품이 됩니다.', material: '플래티넘 · 다이아몬드', detail: '크라운 모티프 네크리스', note: '소재와 세팅은 맞춤 제작 상담을 통해 설계합니다.' },
  { id: 'timepieces', number: '02', category: 'EXCEPTIONAL TIMEPIECES', name: 'L’Heure Dorée', korean: '타임피스', image: '/images/heure-doree.webp', alt: '샴페인 다이얼과 다이아몬드 브레이슬릿의 하이 주얼리 워치 콘셉트', description: '가장 찬란한 순간은 시간 밖에 머뭅니다. 샴페인빛 다이얼과 보석의 구조가 손목 위에서 고요한 존재감을 드러냅니다.', material: '플래티넘 · 다이아몬드', detail: '주얼리 브레이슬릿 워치', note: '무브먼트와 소재 사양은 제작 개발 단계에서 확정됩니다.' },
  { id: 'parfum', number: '03', category: 'ART OF PARFUM', name: 'Le Désir', korean: '향수', image: '/images/le-desir.webp', alt: '왕관 모양 골드 캡과 AUQUE 레터링을 담은 크리스털 향수병 콘셉트', description: '눈에 보이지 않는 가장 깊은 인상. 빛을 품은 크리스털과 황금빛 왕관, 그리고 오직 당신을 위해 구상하는 향의 초상.', material: '크리스털 · 골드 톤 캡', detail: '비스포크 프래그런스 오브제', note: '향조와 용량은 퍼스널 크리에이션 과정에서 제안합니다.' },
] as const;
export type Creation = (typeof collection)[number];

