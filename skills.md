# skills.md — Claude Code 스킬 & 워크플로 가이드

> 이 프로젝트에서 작업할 때 사용하는 **Claude Code 스킬**과 **표준 워크플로**.
> 상위 지침: [CLAUDE.md](./CLAUDE.md)

---

## 1. 작업 유형별 스킬 매핑

| 상황 | 사용 스킬 | 비고 |
| --- | --- | --- |
| 새 기능/화면 기획 | `superpowers:brainstorming` | 구현 전 의도·요구사항 탐색 |
| 기능/버그 구현 | `superpowers:test-driven-development` | 가능하면 테스트 우선 |
| 버그·오류·이상동작 | `superpowers:systematic-debugging` | 추측 금지, 체계적 디버깅 |
| 멀티스텝 작업 계획 | `superpowers:writing-plans` | 스펙 → 단계별 계획 |
| 계획 실행 | `superpowers:executing-plans` | 체크포인트 검토 |
| 완료 직전 검증 | `superpowers:verification-before-completion` | "됐다" 주장 전 증거 확보 |
| 코드 리뷰 요청 | `superpowers:requesting-code-review` | 병합 전 |
| UI 컴포넌트/화면 제작 | `frontend-design:frontend-design` | [design.md](./design.md)와 병행 |
| 한글(HWPX) 문서 작업 | `anthropic-skills:hwpx` | `md2hwp` 관련 디버깅 시 참고 |

> 규칙: 작업에 스킬이 1%라도 적용될 수 있으면 **먼저 스킬을 호출**한다.
> 프로세스 스킬(brainstorming/debugging) → 구현 스킬(frontend-design) 순서.

---

## 2. 표준 개발 워크플로

```
1. HANDOFF.md §9 확인 → 무엇을 할지 파악
2. (창작·신규기능) brainstorming 으로 요구사항 정리
3. (필요시) writing-plans 로 단계 계획
4. design.md / 기존 코드 패턴 확인
5. 구현 (서버/클라이언트 분리, 도메인 규칙 준수)
6. npm run lint + npm run build 로 검증
7. verification-before-completion 으로 "완료" 확인
8. HANDOFF.md §9 갱신
9. (사용자 요청 시에만) commit/push
```

---

## 3. 이 프로젝트 특화 주의점

- **Supabase 연동 작업** → 환경변수(`.env.local`) 존재 확인이 우선. 없으면 빌드/UI까지만 검증 가능.
- **Gemini AI 작업** → `src/lib/gemini.ts`의 프롬프트·JSON 스키마·재시도/fallback 패턴을 깨지 말 것.
- **Next.js 16.2.3** → 학습 데이터와 다를 수 있으니, 새 API는 `node_modules/next/dist/docs/` 확인 후 사용.
- **MCP `context7`** → 라이브러리(Next.js, Mantine, Supabase 등) 최신 문서가 필요하면 web search보다 context7 우선 사용.

---

## 4. 검증 명령

```bash
npm run lint     # 코드 스타일/오류
npm run build    # 타입체크 + 프로덕션 빌드 (배포 전 필수)
npm run dev      # 로컬 동작 확인 (.env.local 필요)
```

> "완료"라고 말하기 전 반드시 위 명령 결과(증거)를 확인한다. 추측으로 성공을 주장하지 않는다.
