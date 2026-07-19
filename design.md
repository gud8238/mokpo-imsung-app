# design.md — 디자인 시스템 가이드

> **BOOK돋움 질문도감**의 UI/UX 규칙. 화면·컴포넌트 작업 전에 이 문서를 따른다.
> 상위 지침: [CLAUDE.md](./CLAUDE.md)

---

## 1. 디자인 철학

- **대상**: 초등학교 1~6학년 + 교사. → 직관적이고 따뜻하며 친근한 느낌.
- **분위기**: 보라/파랑 그라데이션 기반의 부드럽고 밝은 톤. 둥근 모서리, 부드러운 그림자, 가벼운 애니메이션.
- **영역별 색 구분**: 학생=**보라(violet/indigo)**, 교사=**파랑(blue)**. 이 구분을 반드시 유지.

---

## 2. 컬러 토큰

### 테마 (루트 — `src/app/layout.tsx`)
- `primaryColor: 'indigo'`, `defaultRadius: 'lg'`
- indigo 팔레트(0→9): `#edf2ff #dbe4ff #bac8ff #91a7ff #748ffc #5c7cfa #4c6ef5 #4263eb #3b5bdb #364fc7`

### 영역별 헤더 그라데이션
| 영역 | 그라데이션 |
| --- | --- |
| 학생 헤더 | `linear-gradient(135deg, #3b1fa8 0%, #6d28d9 60%, #7c3aed 100%)` |
| 학생 본문 배경 | `linear-gradient(160deg, #f0ebff 0%, #ede9fe 40%, #e8e0ff 100%)` |
| 교사 헤더 | `linear-gradient(135deg, #0f2557 0%, #1e3a8a 60%, #1d4ed8 100%)` |
| 교사 본문 배경 | `linear-gradient(160deg, #eff6ff 0%, #dbeafe 40%, #e0e7ff 100%)` |
| 주요 버튼/포인트 | `linear-gradient(135deg, #4c6ef5, #7950f2)` (보라-파랑) |
| 로그인 오버레이 | `linear-gradient(135deg, rgba(30,20,60,0.55), rgba(60,30,90,0.45))` |

### 질문 유형 색상 (도메인 고정)
| 유형 | Mantine color |
| --- | --- |
| 사실 질문 `factual` | `blue` |
| 궁금 질문 `inferential` | `violet` |
| 라면 질문 `evaluative` | `orange` |

### 상태 색상
- 정답/성공: `green` · 다시 생각: `yellow` · 오류: `red`

---

## 3. 타이포그래피

- 폰트: **Pretendard** (CDN, `layout.tsx`의 `<head>`에서 로드)
  - `"Pretendard Variable", Pretendard, -apple-system, ... sans-serif`
- 제목: `Title order={2~4}`, 굵게(`fw={700~800}`), `letterSpacing: -0.5`
- 본문: `Text size="sm"~"md"`, 줄간격 `lineHeight: 1.6~1.8` (가독성)
- 보조 설명: `c="dimmed"`, `size="xs"`

---

## 4. 컴포넌트 패턴 (Mantine v9)

- **레이아웃**: `AppShell`(header 64px) + `Container size="md"|"lg"` + `py="xl"`
- **카드**: `Paper`/`Card` + `radius="lg"|"xl"` + `shadow="sm"|"md"|"xl"` + `withBorder`
- **간격**: `Stack gap="md"|"lg"`, `Group gap="sm"|"md"`
- **그리드**: `SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }}` (반응형 필수)
- **배지**: 질문 유형/상태 표시는 `Badge variant="light"|"filled"` + 위 색상 토큰
- **아이콘**: `@tabler/icons-react` (예: `IconBulb`, `IconSparkles`, `IconSend`)
- **버튼**: 주요 액션은 그라데이션 배경 + `radius="md"` + `leftSection` 아이콘
- **반응형**: `visibleFrom="xs"|"sm"`, `hiddenFrom` 으로 모바일 대응

---

## 5. 애니메이션 / 인터랙션 (`globals.css`)

| 클래스 | 용도 |
| --- | --- |
| `.book-card` | hover 시 `translateY(-6px)` + 그림자 (책/학생 카드) |
| `.question-type-card` / `.selected` | hover `scale(1.03)`, 선택 시 indigo 테두리 |
| `.ai-feedback-enter` | AI 결과 등장 시 `fadeInUp 0.6s` |
| `.loading-pulse` | 로딩 중 `pulse 1.5s` 무한 반복 |
| `.nav-link` / `.active` | 네비게이션 hover/활성 강조 |

- 커스텀 스크롤바: 보라 계열(`#bac8ff` → hover `#91a7ff`)
- 모든 `a, button`: `transition: all 0.2s ease` 기본 적용

---

## 6. 이모지 사용 규칙

- 기능별 일관된 이모지 사용:
  - 📘 사실 질문 · 🔍 궁금 질문 · 💭 라면 질문
  - 🤖 AI 분석 · 💬 피드백 · 🌟 격려 · ✏️ 작성 · 📤 제출 · 📚 책 목록 · 📊 대시보드
- 과하지 않게, 의미를 돕는 선에서 사용.

---

## 7. 새 화면 만들 때 체크리스트

- [ ] 학생/교사 영역에 맞는 색 테마(보라/파랑)를 적용했는가
- [ ] `Container` + `Paper/Card radius="lg"` 패턴을 따랐는가
- [ ] 반응형 `SimpleGrid`/`visibleFrom` 처리를 했는가
- [ ] 문구가 한국어 해요체 + 적절한 이모지인가
- [ ] 질문 유형 색상/라벨이 도메인 매핑과 일치하는가
- [ ] 로딩/빈 상태(empty state) UI를 제공했는가

---

## 8. 2026 저다각형 스토리북 디자인 시스템

이번 전면 개편은 **B안: 하이브리드 스토리북**을 기준으로 한다.

- 로그인은 제공된 `/backgrounds/login-forest.gif` 포스터를 유지하고 WebGL 장면을 비활성화한다. `prefers-reduced-motion: reduce`에서는 `/low-poly/login-forest.webp` 정적 포스터로 대체한다.
- 학생 영역은 보라색 독서 탐험길, 교사 영역은 파란색 관찰소 분위기를 유지한다.
- 본문은 반드시 `StorySurface`처럼 불투명도 94% 이상의 밝은 표면 위에 배치한다. 배경 장식 위에 본문을 직접 올리지 않는다.
- 3D 캔버스와 장식 레이어는 `pointer-events: none`으로 두고 콘텐츠보다 낮은 z-index를 사용한다.
- 768px 미만 화면에서는 WebGL 대신 가벼운 CSS 장면을 사용한다.
- `prefers-reduced-motion: reduce`에서는 장면을 정적 포스터로 바꾸고 반복 애니메이션을 중지한다.
- WebGL 생성 실패, 탭 숨김, 저성능 조건에서는 CSS 장면으로 안전하게 폴백한다.
- 질문 유형 선택은 키보드로 조작 가능한 라디오 그룹이어야 하며, 아이콘 전용 버튼과 입력창에는 접근성 이름을 제공한다.
- 학생·교사 공통 셸에는 본문 건너뛰기 링크와 명확한 `main` 대상을 둔다.

### 저다각형 에셋

`public/low-poly/`의 에셋은 로그인 숲, 학생 탐험길, 교사 관찰소와 책·질문·프로필 보석 아이콘으로 구성된다. 배경 이미지는 중앙 콘텐츠 영역이 비어 있는 구도를 사용하고, 아이콘 이미지는 투명 배경을 유지한다.
