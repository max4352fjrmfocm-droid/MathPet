# 프로젝트 메모 (Claude Code용)

## 무엇을 만드는가
초등 1학년 자녀용 안드로이드 교육 게임. 사칙연산 + 구구단 학습, 보상으로 다마고치형 펫 육성.
순수 HTML/CSS/JS 웹앱으로 만들고, 완성 후 Capacitor로 안드로이드 앱 패키징 예정.

## 결정 사항
- 프레임워크 없음, 빌드 없음. `index.html` + `css/style.css` + `js/app.js` 3개 파일이 전부.
- 저장은 localStorage(`mathpet_save_v1`). 서버/로그인 없음.
- 캐릭터는 **피그미 다람쥐**(2026-11-21 확정). 사용자가 그린 4포즈 시트(idle/eat/happy/sleep)를 잘라 `assets/pet_<pose>.png`로 사용. 성장 단계(acorn/baby/child/teen)는 Canva AI로 생성. `pet_legend.png`는 Canva 크레딧 소진으로 미생성 → CSS 금빛 광채로 대체. 이름 규칙은 assets/README.md.
- 꾸미기 상점(`screen-shop`): 모자/옷/악세사리/가구. 아이템은 이모지 오버레이(`ITEMS`의 pos/r로 위치·크기). `S.items.owned`, `S.items.equip`. 가구는 홈·펫·상점 카드 배경에 표시.
- UI 언어는 한국어. 글자 크게, 버튼 크게(최소 56px), 세로 폰 기준(최대 480px).
- 아이가 쓰므로 펫은 죽지 않음, 벌점 없음, 틀리면 정답만 보여주고 넘어감.

## 작업 폴더 / 두 PC에서 작업 (2026-11-21 GitHub으로 전환)
- 원본은 GitHub 저장소 `max4352fjrmfocm-droid/MathPet` (public). 집 PC 로컬 폴더: `C:\Users\max43\MathPet`.
- 회사 PC에서는 Git + GitHub CLI 설치 후 `gh auth login`, `gh repo clone max4352fjrmfocm-droid/MathPet` 하고 그 폴더를 Claude Code로 열면 됨.
- 작업 끝나면 반드시 commit + push. 다른 PC에서 시작할 때 먼저 `git pull`.
- 예전 Google Drive 폴더(`H:\내 드라이브\MathPet`)는 백업 사본일 뿐, 더 이상 편집하지 않음.
- 대화 기록은 PC별로 따로 남으므로, 결정 사항은 이 파일(CLAUDE.md)에 계속 적을 것.

## 미리보기
- 집 PC에는 Node/Python 없음(Git, gh는 있음). `tools/serve.ps1`(PowerShell HttpListener)로 정적 서빙.
- Claude Code 우측 브라우저: `.claude/launch.json`의 `mathpet` 설정으로 `preview_start`, 모바일 뷰포트로 확인.
- 실제 배포본 확인: https://max4352fjrmfocm-droid.github.io/MathPet/

## 구현된 기능 (v0.2, 2026-11-21)
- 퀴즈 10문제/세션, 정답 🪙10(+3연속 5), 세션 별점에 따라 간식 보상.
- 오답 시 `explainHTML()`로 풀이 모달: 점 그림(10 이하), 10 만들기, 자릿수 나누기, 곱셈=묶음 그림+반복 덧셈, 나눗셈=묶기. "다시 풀어볼래요"로 재도전(점수 없음, XP +2).
- 출석: 7일 주기 도장(`ATTEND_REWARDS`), 하루 1회 자동 팝업, 홈의 출석 버튼에서 도장판 확인.
- 성장: 단계(알→아기→어린이→청소년→어른→전설) + 레벨(XP 50마다, 🪙5) + 진화 보너스 🪙50 + 같은 단계 안에서 펫 크기 0.8→1.1배(`--grow`). 성장 앨범 화면(`screen-album`)에 달성일 기록(`S.album`).
- 저장 데이터 버전 2. `load()`에서 구버전 보정(앨범/레벨).
- 캐릭터 기본 동작(2026-11-22): `idleAct()`가 2~4초마다 산책(좌우 걷기+방향 전환 `--face`)·깡충·갸웃·뒤돌기 중 하나. 위치는 `.pet-slot`의 `--wx`(px) transform으로 유지되어 재렌더에도 안 튐. 반응 포즈·잠·모달 중엔 쉼.
- 배경 무대: `ensureScene()`이 `.pet-stage`에 `.scene`(해·구름·언덕·잔디·꽃·나비, 전부 CSS/이모지) 삽입. `--ground`로 잔디 높이(홈 118px, 상점 compact 30px). 19~6시엔 `body.night`로 보라 하늘+달+별.

## 배포 / 설치 (2026-11-21)
- PWA 구성: `manifest.webmanifest`, `sw.js`(네트워크 우선·캐시 폴백, 캐시명 `mathpet-v2`, 파일 목록 바뀌면 버전 올릴 것), `icons/` (임시 아이콘, `tools/make-icons.ps1`로 생성).
- 호스팅: GitHub Pages (main 브랜치 루트). 주소 https://max4352fjrmfocm-droid.github.io/MathPet/ . push 후 1~2분이면 반영.
- 설치: `tools/qr.html`(기본값에 위 주소 들어 있음) 또는 `tools/install-qr.png`를 폰 카메라로 → 홈 화면에 추가. 자녀 폰은 아이폰일 가능성 높음 → 앱스토어/TestFlight 없이 PWA가 유일한 무료 경로.
- 업데이트(패치): 수정 후 commit + push만 하면 폰에서 다음 실행 때 자동 반영. 재설치 불필요, 저장 데이터 유지.
- 설정 화면에 설치 안내 카드 + 안드로이드용 `beforeinstallprompt` 설치 버튼.

## 다음에 할 만한 것
- 사용자 제공 캐릭터 이미지 적용
- 효과음 파일 교체(현재는 Web Audio 비프음)
- 부모 설정(하루 목표, 학습 시간 제한)
- Capacitor로 안드로이드 패키징
