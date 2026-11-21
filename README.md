# 수학 펫 키우기 (MathPet)

초등학교 1학년을 위한 사칙연산·구구단 학습 게임입니다. 문제를 풀어 코인과 간식을 얻고, 그걸로 다마고치처럼 펫을 키웁니다.

## 구성

```
index.html        화면 구조 (홈 / 공부 선택 / 퀴즈 / 결과 / 펫 돌보기 / 구구단표 / 설정)
css/style.css     디자인 (세로 폰 화면 기준, 최대 너비 480px)
js/app.js         게임 로직 전체 (문제 생성, 보상, 펫 상태, 저장)
assets/           펫 이미지를 넣는 폴더 (assets/README.md 참고)
tools/serve.ps1   로컬 미리보기용 PowerShell 정적 서버 (Node/Python 불필요)
.claude/launch.json  Claude Code 우측 브라우저 미리보기 설정
```

## 로컬에서 실행

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/serve.ps1 -Port 5173
```

그 다음 브라우저에서 http://localhost:5173 을 엽니다.
(그냥 index.html 파일을 더블클릭해도 대부분 동작합니다.)

## 게임 규칙 요약

- 한 세션 10문제. 정답마다 🪙10, 3연속 이상 정답이면 +5 보너스.
- 세션 결과: 9개 이상 ★3 + 케이크, 7~8개 ★2 + 쿠키, 그 외 ★1 + 사과. 별 개수 × 10 코인 추가.
- 단계: 1단계(10까지 / 2~5단), 2단계(20까지 / 6~9단), 3단계(100까지 / 2~9단 전체).
- 펫 상태(배고픔·행복·청결)는 실제 시간이 지나면 떨어짐(시간당 4/3/2). 최소 5까지만 떨어지고 죽지는 않음.
- 간식을 주면 XP가 올라가고, XP에 따라 알 → 아기 → 어린이 → 청소년 → 어른 → 전설로 진화. 진화하면 🪙50, XP 50마다 레벨 업 🪙5. 같은 단계 안에서도 XP가 쌓이면 펫이 조금씩 커짐.
- 성장 앨범에서 단계별 달성 날짜와 다음 단계까지 남은 XP 확인.
- 출석: 하루에 한 번 앱을 켜면 도장이 찍히고 간식+코인 지급. 7일 주기(7일째 케이크 + 🪙30).
- 오답 시 풀이 모달: 점 그림으로 세기, 10 만들기, 자릿수 나누기, 곱셈 묶음 그림, 나눗셈 묶기. "다시 풀어볼래요"로 재도전 가능(점수 없음).
- 모든 데이터는 기기의 localStorage에 저장(인터넷 불필요).

## 스마트폰에 설치하기 (앱스토어 없이, 아이폰·안드로이드 공통)

이 게임은 PWA(홈 화면에 추가되는 웹앱)라서 인터넷 주소에 올리기만 하면 폰에 설치됩니다.

1. **인터넷에 올리기** (무료 정적 호스팅 중 하나)
   - Netlify Drop: https://app.netlify.com/drop 에 로그인 후 이 `MathPet` 폴더를 통째로 드래그 → 주소 발급 (`https://xxxx.netlify.app`)
   - Cloudflare Pages / GitHub Pages / Vercel 도 가능. 폴더를 그대로 올리면 됨 (빌드 없음).
   - 반드시 **https** 주소여야 홈 화면 설치와 오프라인 동작이 됩니다.
2. **QR 만들기**: `tools/qr.html` 을 열고 주소를 넣으면 QR이 나옵니다. 인쇄하거나 PNG로 저장.
3. **아이 폰에서**: 카메라로 QR을 비춰 열고
   - 아이폰(Safari): 공유 버튼 → **홈 화면에 추가**
   - 안드로이드(Chrome): ⋮ 메뉴 → **홈 화면에 추가 / 앱 설치** (설정 화면의 "앱으로 설치" 버튼으로도 가능)
4. 홈 화면 아이콘으로 열면 전체 화면으로 실행되고, 한 번 연 뒤에는 인터넷 없이도 됩니다.

게임을 수정한 뒤에는 같은 곳에 다시 올리면 폰에서 다음 실행 때 자동으로 새 버전을 받습니다. 저장 데이터(펫, 코인)는 폰에 그대로 남습니다.

아이콘은 `tools/make-icons.ps1` 로 만든 임시 그림입니다. 캐릭터 이미지가 준비되면 `icons/icon-180.png`, `icon-192.png`, `icon-512.png` 를 교체하면 됩니다.

## 안드로이드 앱으로 만들기 (추후, 선택)

[Capacitor](https://capacitorjs.com/)로 이 폴더를 그대로 감싸서 APK/AAB를 만들 수 있습니다. Node.js와 Android Studio가 필요합니다.

```bash
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "수학 펫 키우기" com.example.mathpet --web-dir .
npx cap add android
npx cap open android
```

Android Studio에서 Build > Build Bundle(s)/APK(s) 로 빌드하면 됩니다.
