# 오늘의 책, AI 사서

기분 · 좋아하는 장르 · 오늘 읽을 수 있는 시간을 입력하면, Anthropic Claude AI가 조건에 맞는 책 3권과 추천 이유를 알려주는 웹 서비스입니다.

- **배포 URL**: https://a1-3-j78t.vercel.app
- **GitHub**: https://github.com/codyssey-seungmin/A1-3

## 주요 기능
- 홈 / AI 책 추천 / 소개 / FAQ, 4개 페이지와 공통 네비게이션 (모바일에서는 햄버거 메뉴)
- 반응형 레이아웃 (데스크톱 / 태블릿 / 모바일)
- AI 책 추천: 기분·장르·시간 입력 → Claude API 호출 → 책 3권 추천 결과 출력
- 실패 처리: 빈 입력 안내, API 오류 안내, 응답 지연(타임아웃) 안내

## 기술 스택
| 영역 | 기술 |
|---|---|
| 프론트엔드 | HTML / CSS / JavaScript (바닐라, 프레임워크 미사용) |
| 백엔드 | Vercel Serverless Functions (Python) |
| AI | Anthropic Claude API (`anthropic` 파이썬 패키지) |
| 배포 | GitHub + Vercel |

## 프로젝트 구조
```
A1-3/
├── index.html          # 홈
├── recommend.html       # AI 책 추천 페이지
├── about.html            # 소개
├── faq.html              # FAQ
├── css/
│   ├── style.css        # 공통 스타일 (헤더/네비/반응형 등)
│   └── recommend.css    # 추천 페이지 전용 스타일
├── js/
│   ├── main.js          # 공통 스크립트 (모바일 메뉴 토글)
│   └── recommend.js     # 추천 폼 검증, fetch 요청, 결과 렌더링
├── api/
│   └── recommend.py     # Claude API 연동 서버리스 함수
├── docs/
│   └── service-plan.md  # 서비스 기획서
├── requirements.txt      # Python 의존성
└── vercel.json           # Vercel 빌드 설정 (정적 파일과 Python 함수 분리)
```

## 로컬에서 실행하는 방법
이 프로젝트의 프론트엔드는 정적 파일이라 브라우저로 `index.html`을 열어도 화면 확인은 가능하지만,
AI 추천 기능(`/api/recommend`)은 Vercel 서버리스 함수이므로 아래 방법 중 하나로 실행해야 동작합니다.

1. **Vercel CLI로 로컬 실행** (Node.js 필요)
   ```
   npm install -g vercel
   vercel dev
   ```
2. **Vercel에 직접 배포 후 확인** (아래 배포 방법 참고)

## 배포 방법 (Vercel)
1. 교육장(Codyssey)에서 제공하는 Anthropic 호환 API 키(virtual key)를 발급받는다. (호출 주소는 `https://copa.codyssey.kr`로 코드에 고정되어 있음)
2. [vercel.com](https://vercel.com)에 GitHub 계정으로 로그인 후, 이 저장소(`codyssey-seungmin/A1-3`)를 Import한다.
3. 프로젝트 설정의 **Environment Variables**에 아래 값을 추가한다.
   - `ANTHROPIC_API_KEY` = 발급받은 virtual key
4. Deploy를 실행하면 배포가 완료되고 `*.vercel.app` 형태의 URL이 발급된다.
5. 이후 GitHub `main` 브랜치에 push할 때마다 Vercel이 자동으로 재배포한다.

## 환경 변수 설정
- 로컬 개발 시: `.env.example`을 복사해 `.env` 파일을 만들고, `ANTHROPIC_API_KEY` 값을 채워 넣는다. (`.env`는 `.gitignore`에 등록되어 있어 커밋되지 않는다)
- Vercel 배포 시: 프로젝트 Settings → Environment Variables 에서 동일한 키를 등록한다.
- API 키는 절대 코드나 README, 스크린샷에 노출하지 않는다.
