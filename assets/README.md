# 캐릭터 이미지 (피그미 다람쥐)

게임은 아래 이름 규칙으로 이미지를 찾습니다. 있으면 쓰고, 없으면 다음 후보로 넘어가며, 끝내 없으면 이모지를 씁니다.

| 우선순위 | 파일 이름 | 용도 |
|---|---|---|
| 1 | `pet_<단계>_<포즈>.png` | 특정 단계의 특정 포즈 (예: `pet_baby_eat.png`) |
| 2 | `pet_<포즈>.png` | 공통 포즈. 어른·전설 단계의 기본 모습 (`pet_idle.png`, `pet_eat.png`, `pet_happy.png`, `pet_sleep.png`) |
| 3 | `pet_<단계>.png` | 단계별 기본 모습 (`pet_acorn.png`, `pet_baby.png`, `pet_child.png`, `pet_teen.png`, `pet_legend.png`) |
| 4 | `pet_<동작>_<번호>.png` | 동작 프레임(어른). `walk`(걷기), `cheer`(기쁨·만세), `idle`(가만히: 숨쉬기·두리번), `eat`(간식 먹기), `sleep`(잠). 번호 1부터 이어서, 최대 8장. 제미나이용 프롬프트는 `tools/gemini-prompts.md`. 있으면 조각 인형 대신 프레임을 순서대로 넘겨서 잘림 없이 움직임 |
| 5 | `pet_<단계>_<동작>_<번호>.png` | 단계별 동작 프레임 (예: `pet_baby_walk_1.png`) |

단계: `acorn`(도토리, 0 XP) → `baby`(100) → `child`(300) → `teen`(700) → `adult`(1300) → `legend`(2200)
포즈: `idle` 기본 / `eat` 간식 먹을 때 / `happy` 정답·놀기·칭찬 / `sleep` 상태가 나쁠 때

## 현재 들어 있는 파일
- `pet_idle/eat/happy/sleep.png`: 사용자가 그린 포즈 시트에서 잘라낸 것 (`tools/split-sheet.ps1`)
- `pet_acorn/baby/child/teen.png`: 위 캐릭터를 참고해 Canva AI로 생성 (`_raw/`에 원본)
- `pet_idle_1~4.png`, `pet_eat_1~4.png`, `pet_sleep_1~4.png`: 제미나이로 생성한 가만히·먹기·잠 4프레임 (`_raw/sheet_idle.png` 등)
- `pet_teen_idle/eat/walk/sleep_1~4.png`: 청소년 단계 4동작 (제미나이). 만세는 아직 없어 `pet_teen.png` 조각 인형 사용
- `pet_legend_idle_1~4.png`, `pet_legend.png`: 전설 단계 (왕관·망토·금빛 광채, 제미나이). 광채가 옆 프레임과 겹쳐 `fade-edges.ps1`로 가장자리를 흐리게 함
- `pet_walk_1~4.png`, `pet_cheer_1~4.png`: Canva AI로 생성한 걷기·만세 4프레임(`_raw/sheet_walk.png`, `sheet_cheer.png`에서 `split-sheet.ps1` → `normalize-frames.ps1`)

## 권장 규격
- 배경 투명 PNG, 정사각형, 512×512 정도
- 캐릭터가 아래쪽 중앙에 서 있는 구도 (모자·안경 위치가 이 구도 기준으로 맞춰져 있음)

## 도구
- `tools/split-sheet.ps1`: 흰 배경 포즈 시트를 잘라 투명 PNG로 (`-Names idle,eat,happy,sleep`)
- `tools/clean-sprite.ps1`: 잘린 조각 지우기 (`-Erase "x,y,w,h"`)
- `tools/resize-png.ps1`: 512px로 축소
- `tools/normalize-frames.ps1`: 프레임들을 같은 크기 정사각형(아래 중앙 정렬)으로 맞춰 512px 저장 (프레임 크기가 다르면 캐릭터가 들쭉날쭉 커졌다 작아짐)
- `tools/import-sheet.ps1`: 시트 한 장을 위 과정(변환→자르기→정리→크기 맞추기)으로 한 번에 처리 (`-Image 파일 -Name teen_walk`)
- `tools/fade-edges.ps1`: 광채가 있는 프레임의 가장자리 알파를 타원형으로 흐리게 (잘린 직선 숨김)
- `tools/make-icons.ps1`: `pet_idle.png`로 앱 아이콘 생성
