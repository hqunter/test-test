# Market Lens

미국 10년물 금리·금시세와 미국지수의 관계를 일별 데이터로 살펴보는 로컬 MVP입니다.

## 실행

```text
pnpm dev
```

브라우저에서 `http://localhost:3000`을 엽니다. 현재 화면은 Supabase 연결 전 데모 데이터 모드입니다.

## 분석 기준

- 주식지수: 일별 수익률
- 미국 10년물 금리: 일별 금리 변화폭
- 금시세: 일별 수익률
- Pearson 상관계수 및 30일 롤링 상관

Supabase 테이블 초안은 `supabase/schema.sql`에 있습니다. Vercel 배포 시 환경변수는 `.env.example`을 기준으로 설정합니다.
