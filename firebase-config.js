/* ============================================================
   피클 합동 비서실 — Firebase Realtime Database 설정
   ------------------------------------------------------------
   Firebase 콘솔 → 프로젝트 설정 → 내 앱 → SDK 설정 및 구성의
   firebaseConfig 값을 아래에 그대로 붙여넣으면 끝이에요.

   * 웹 앱의 apiKey는 공개되어도 되는 식별자예요. (비밀 키가 아님)
     다만 아래 databaseURL의 Realtime Database 규칙이 열려 있으면
     누구나 읽고 쓸 수 있으니, 개인정보는 올리지 마세요.
   * OpenAI API 키는 절대 여기에 넣지 마세요.
     OpenAI 키는 브라우저(localStorage)에만 저장되고
     GitHub / Firebase로는 전송되지 않아요. (앱의 🤖 설정 화면에서 입력)
   * 비워두면 앱은 로컬 데모 모드(localStorage)로 동작해요.
     나중에 앱 안의 ⚙️ 설정 화면에서 붙여넣어도 됩니다.
   ============================================================ */

window.PICKLE_FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
