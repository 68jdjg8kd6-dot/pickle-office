# 🥒 피클 합동 비서실 (Pickle Shared Assistant Office)

따뜻한 크림빛 **3D 클레이 미니어처 오피스**에서 피클들이 함께 일하는 합동 비서실 웹페이지예요.
공간을 옮겨 다니고, 상태를 남기고, 화이트보드에 메모를 붙이고, 실시간으로 대화할 수 있어요.

**라이브:** https://68jdjg8kd6-dot.github.io/pickle-office/

## 이렇게 생겼어요

- **오피스 맵** — 클레이로 빚은 3D 아이소메트릭 오피스 그림 위에 **대회의실 · 지휘실 · 라운지** 배지가 떠 있어요. 배지를 누르면 내 피클이 그 방으로 이동하고, 방 화면에서 그 공간이 확대되며 그 방의 비서들이 보여요. 방 화면에서는 내 피클을 끌어서 원하는 자리에 세울 수 있어요.
- **화면 구성** — `오피스 맵` / `대회의실` / `지휘실` / `비서현황` / `AI 연결` / `메모` 여섯 칸 메뉴. 오피스 맵과 방 화면에는 대화창이 함께 붙어 있어요.
- **피클 캐릭터** — 한글 자음(ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ ㅇ ㅈ ㅊ ㅋ ㅌ ㅍ ㅎ)이 몸이 된 캐릭터. 눈을 깜빡이고 살랑살랑 숨 쉬어요. 이름·자음·색·상태를 바꿀 수 있어요.
- **대화** — 실시간 채팅. 내 말은 라일락 버블로 오른쪽에 붙어요.
- **화이트보드** — 메모와 할 일을 포스트잇처럼 붙이고 체크할 수 있어요. 지운 메모는 되돌릴 수 있어요.
- **🤖 AI 동료** — 회의실에 있는 AI 동료. **Google Gemini**(무료 키 추천, 기본 `gemini-2.5-flash`) 또는 **OpenAI(ChatGPT)** 중 골라서 써요. 채팅에서 `@제미나이` · `@gemini` · `@챗지피티` · `@chatgpt` · `@ai` 라고 부르거나 입력창의 🤖 버튼을 켜두면 대답해요.
- **모바일 대응** — iPhone에서도 방이 세로로 쌓이고 채팅이 편하게 보여요.
- **저장 방식** — 기본은 이 브라우저(localStorage) 저장 + 탭끼리 BroadcastChannel 공유. Firebase Realtime Database를 연결하면 모든 기기에서 실시간으로 함께 써요.

## 1. 그냥 열어보기 (로컬 데모 모드)

별도 설정 없이 URL을 열면 바로 동작해요. 1호(ㅇ, 라일락)와 샘플 피클 친구 3명(2호·3호·5호)이 미리 들어와 있어요.
샘플 친구들은 목록에 `샘플` 이라고 표시돼요.

같은 컴퓨터에서 탭을 두 개 열면 서로 실시간으로 움직이는 걸 볼 수 있어요.
(다른 기기와 함께 쓰려면 아래 Firebase 연결이 필요해요.)

## 2. Firebase Realtime Database 연결하기 (무료)

1. <https://console.firebase.google.com> 에서 **프로젝트 추가**.
2. 왼쪽 **빌드 → Realtime Database → 데이터베이스 만들기**. 위치는 가까운 곳(예: asia-southeast1)을 고르고 **테스트 모드**로 시작.
3. **규칙(Rules)** 탭에서 아래처럼 바꿔요.

   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```

   > 테스트용으로 열어둔 규칙이에요. 누구나 읽고 쓸 수 있으니 개인정보·비밀은 올리지 마세요.

4. **프로젝트 설정(⚙️) → 내 앱 → SDK 설정 및 구성**에서 `firebaseConfig` 값을 복사해요.
5. 이 페이지 오른쪽 위 **⚙️ 설정**에 그대로 붙여넣고 **연결 & 저장**.
   또는 `firebase-config.js` 의 `window.PICKLE_FIREBASE_CONFIG` 에 붙여넣고 다시 배포해도 돼요.
   (`databaseURL` 만 붙여넣어도 연결돼요.)

연결되면 상단 배지가 **실시간 연결**로 바뀌고, 같은 링크를 연 모든 기기에서 피클들이 함께 움직여요.
데이터는 `office/pickles`, `office/messages`, `office/notes` 아래에 저장돼요.

## 3. 🤖 AI 동료 연결하기 (Google Gemini · OpenAI)

비서실의 AI 동료는 **Google Gemini**와 **OpenAI(ChatGPT)** 둘 다 지원해요. 오른쪽 위 **🤖 버튼 → 사용할 AI**에서 고르면 돼요. 고른 제공자의 이름이 오피스·대화·피클 목록에 그대로 보여요(제미나이 ↔ 챗지피티).

### Google Gemini (무료 키 추천)

1. <https://aistudio.google.com/app/apikey> 에 구글 계정으로 로그인해요. (카드 등록 없이 무료 등급으로 시작할 수 있어요)
2. **API 키 만들기**를 눌러 `AIza...` 로 시작하는 키를 복사해요.
3. **🤖 버튼 → Google Gemini** 를 고르고 키를 붙여넣은 뒤 **연결 테스트 → 저장**.
4. 모델은 `gemini-2.5-flash`(기본·빠름), `gemini-2.0-flash`, `gemini-2.5-pro` 중에서 골라요.

무료 등급은 1분/하루 사용량 한도가 있어요. 한도에 걸리면 `429` 안내가 뜨고, 잠시 뒤에 다시 물어보면 돼요.

### OpenAI (ChatGPT)

1. <https://platform.openai.com/api-keys> 에서 API 키(`sk-...`)를 만들어요.
2. **🤖 버튼 → OpenAI (ChatGPT)** 를 고르고 키를 붙여넣은 뒤 **저장** (모델은 기본 `gpt-4o-mini`).

### 이렇게 물어보세요

```
@제미나이 이번 주 할 일 정리해줘
@ai 회의 안건 세 줄로 요약해줘
```

입력창 왼쪽 🤖 버튼을 켜두면 평소처럼 보낸 말을 AI 동료가 함께 읽고 답해요.
화이트보드 메모에 `@제미나이` 를 넣어도 답이 대화에 남아요.
어느 이름으로 불러도 **지금 고른 제공자**가 대답해요.

### 키 보안

- 키는 **이 브라우저의 `localStorage` 에만** 저장돼요. 코드·GitHub·Firebase 어디에도 저장되지 않아요.
- 대화를 요청할 때만 Gemini 키는 `generativelanguage.googleapis.com`, OpenAI 키는 `api.openai.com` 으로 전송돼요.
- 공용 컴퓨터에서는 🤖 설정에서 **키 지우기**를 눌러주세요. (제공자마다 따로 지워져요)
- 저장소에는 어떤 키도 하드코딩되어 있지 않아요. (`firebase-config.js` 도 비어 있어요.)

## 파일 구성

| 파일 | 설명 |
| --- | --- |
| `index.html` | 화면 구조 (오피스 맵·방·비서현황·메모·모달) |
| `assets/clay-office.png` | 클레이 3D 오피스 디오라마 (1400px, 웹용 `.webp` 도 함께) |
| `styles.css` | 아기자기 스타일, 캐릭터 애니메이션, 반응형 |
| `app.js` | 상태·렌더링·실시간 동기화·AI 동료(Gemini/OpenAI) 호출 |
| `firebase-config.js` | Firebase 설정 넣는 곳 (기본 비어 있음) |
| `README.md` | 이 문서 |

## 배포

이 저장소의 사이트는 GitHub Pages의 **`gh-pages` 브랜치**에서 제공돼요.
`main`에서 고친 뒤에는 `gh-pages`도 함께 갱신해 주세요.

```bash
git push origin main
git push origin main:gh-pages
```

> GitHub 저장소 **Settings → Pages → Source**에서 `main` / `/ (root)`로 바꾸면 main만 push해도 되지만,
> 이 저장소의 연결 권한에는 Pages 설정 변경 권한이 없어 gh-pages 방식으로 배포했어요.

정적 파일은 `?v=` 쿼리로 캐시를 갱신해요. `styles.css`나 `app.js`를 고치면 `index.html`의 `?v=` 숫자를 올려 주세요.

## 만든 사람

피클 1호의 합동 비서실 프로젝트 🥒
