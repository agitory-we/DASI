/**
 * 한국관광공사 공식 여행가이드북 및 대한민국 구석구석 추천 기사 큐레이션 데이터셋
 * 
 * 구글 수석 아키텍트 원칙: 팩트 기반 공공 데이터 소스
 */

export interface TravelGuidebook {
  id: string;
  title: string;
  theme: '골목·도시재생' | '유네스코·역사' | '웰니스·생태' | '바다·로드';
  publisher: string; // 발행처: 한국관광공사
  summary: string;
  downloadUrl: string;
  coverImageUrl: string;
  pageCount: number;
  publishedYear: string;
  tags: string[];
}

export interface TravelArticle {
  id: string;
  title: string;
  subtitle: string;
  category: '테마출사' | '로컬아카이브' | '골든아워리포트';
  region: string;
  author: string;
  contentUrl: string;
  imageUrl: string;
  readTimeMin: number;
  tags: string[];
}

export const OFFICIAL_GUIDEBOOKS: TravelGuidebook[] = [
  {
    id: 'guide-01',
    title: '시간의 켜를 걷다: 서울 아날로그 골목길 여행기',
    theme: '골목·도시재생',
    publisher: '한국관광공사',
    summary: '을지로 철공소·인쇄 골목부터 종로 계동길, 성수동 붉은 벽돌길까지 아날로그 필름 감성이 살아있는 서울 골목 집중 탐방 가이드.',
    downloadUrl: 'https://knto.or.kr',
    coverImageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    pageCount: 124,
    publishedYear: '2025',
    tags: ['을지로', '골목길', '아날로그', '필름출사'],
  },
  {
    id: 'guide-02',
    title: '렌즈에 담은 천년의 숨결: 한국의 유네스코 세계유산',
    theme: '유네스코·역사',
    publisher: '한국관광공사',
    summary: '경주역사유적지구, 수원화성, 창덕궁, 해인사 등 세계가 인정한 대한민국 대표 문화유산의 사계절 빛과 시선.',
    downloadUrl: 'https://knto.or.kr',
    coverImageUrl: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800&auto=format&fit=crop&q=80',
    pageCount: 168,
    publishedYear: '2025',
    tags: ['유네스코', '고궁', '세계문화유산', '건축출사'],
  },
  {
    id: 'guide-03',
    title: '바람과 숲의 테라피: 대한민국 추천 웰니스 & 생태 로드',
    theme: '웰니스·생태',
    publisher: '한국관광공사',
    summary: '순천만 갯벌 갈대숲, 제주 비자림 원시림, 영주 국립산림치유원 등 심신을 정화하는 슬로우 라이프 자연 출사 루트.',
    downloadUrl: 'https://knto.or.kr',
    coverImageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&auto=format&fit=crop&q=80',
    pageCount: 140,
    publishedYear: '2025',
    tags: ['웰니스', '숲치유', '순천만', '비자림'],
  },
  {
    id: 'guide-04',
    title: '푸른 해안선을 따라: 남해안 바다와 섬 100경',
    theme: '바다·로드',
    publisher: '한국관광공사',
    summary: '여수 백도, 통영 비진도, 거제 바람의 언덕 등 에메랄드빛 다도해와 섬마을 일몰을 기록한 필름 로드 트립.',
    downloadUrl: 'https://knto.or.kr',
    coverImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    pageCount: 152,
    publishedYear: '2024',
    tags: ['남해안', '섬출사', '일몰', '바다풍경'],
  },
];

export const OFFICIAL_ARTICLES: TravelArticle[] = [
  {
    id: 'art-01',
    title: '가을빛 머문 고궁, 필름 한 롤의 미학',
    subtitle: '경복궁 향원정과 덕수궁 석조전에 쏟아지는 아침 사광을 담는 법',
    category: '테마출사',
    region: '서울 종로·중구',
    author: '한국관광공사 대한민국 구석구석',
    contentUrl: 'https://korean.visitkorea.or.kr',
    imageUrl: 'https://images.unsplash.com/photo-1596768401116-29177f1e6727?w=800&auto=format&fit=crop&q=80',
    readTimeMin: 4,
    tags: ['경복궁', '덕수궁', '사광출사', '포트라400'],
  },
  {
    id: 'art-02',
    title: '낡아서 더 눈부신 을지로 인쇄 골목의 오후 4시',
    subtitle: '기계 소리와 잉크 냄새 사이로 스며드는 노을, 흑백 필름의 매력',
    category: '로컬아카이브',
    region: '서울 중구 을지로',
    author: 'DASI 아카이브 × 구석구석',
    contentUrl: 'https://korean.visitkorea.or.kr',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    readTimeMin: 5,
    tags: ['을지로', '흑백필름', '일포드', '철공소'],
  },
  {
    id: 'art-03',
    title: '바람과 갈대가 노래하는 순천만의 황금빛 일몰',
    subtitle: '용산전망대에서 마주한 S자 갯골 물길과 칠면초의 붉은 융단',
    category: '골든아워리포트',
    region: '전남 순천',
    author: '대한민국 구석구석 사진기자단',
    contentUrl: 'https://korean.visitkorea.or.kr',
    imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&auto=format&fit=crop&q=80',
    readTimeMin: 6,
    tags: ['순천만', '황금빛갈대', '용산전망대', '엑타100'],
  },
  {
    id: 'art-04',
    title: '제주 원시림 곶자왈에서 마주한 빛의 파편들',
    subtitle: '용암 바위 위를 뒤덮은 이끼와 천년 숲 사이로 쏟아지는 틴달 빛내림',
    category: '테마출사',
    region: '제주 한경·구좌',
    author: '한국관광공사 프레임코리아 사진기자단',
    contentUrl: 'https://korean.visitkorea.or.kr',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
    readTimeMin: 5,
    tags: ['제주곶자왈', '비자림', '빛내림', '자연치유'],
  },
];
