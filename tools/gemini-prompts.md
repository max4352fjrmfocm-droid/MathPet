# 제미나이(또는 캔바)로 캐릭터 동작 그림 만들기

## 공통 요령
1. **참고 이미지를 꼭 첨부**하세요. 어른 다람쥐는 `assets/pet_idle.png`, 단계별은 `assets/pet_baby.png` / `pet_child.png` / `pet_teen.png`.
2. 프롬프트는 영어가 결과가 더 안정적입니다. 아래 영어 프롬프트를 그대로 붙여 넣고, 필요하면 한글 설명을 참고하세요.
3. 결과는 **가로로 긴 한 장(16:9)에 4프레임이 나란히** 있는 "스프라이트 시트"로 받습니다. 흰 배경이어야 제가 자동으로 잘라 투명 배경으로 만들 수 있습니다.
4. 체크할 것: 4마리가 **같은 크기·같은 그림체·같은 색**인지, 서로 겹치지 않는지, 글자·그림자·테두리가 없는지. 아니면 "same size, no overlap, no text" 를 강조해서 다시 생성.
5. 파일은 `sheet_<동작>.png` 이름으로 저에게 주시면 잘라서 넣습니다. (예: `sheet_idle.png`, `sheet_baby_walk.png`)
   직접 잘라 넣으실 거면 `assets/pet_<동작>_1.png`, `_2.png` … 번호만 이어서 넣으면 자동 인식됩니다. (정사각형, 투명 배경, 캐릭터 아래 중앙 정렬, 512px 권장)

동작 이름: `walk`(걷기) · `cheer`(기쁨·만세) · `idle`(가만히) · `eat`(간식 먹기) · `sleep`(잠)
단계 이름: `baby`(아기) · `child`(어린이) · `teen`(청소년) · (`adult`는 이름 없이 `pet_walk_1.png`처럼)

---

## 공통 머리말 (모든 프롬프트 맨 앞에 붙임)

```
Use the attached image as the exact character reference: a cute chibi pygmy squirrel, kawaii cartoon style, soft brown fur with dark stripes, cream belly, big dark eyes, pink cheeks, fluffy striped tail, thin dark outline. Keep the same proportions, colors, line style and face in every frame.
Output ONE wide image (16:9) containing 4 animation frames of this character side by side in a single row, evenly spaced, all the same size, not overlapping. Full body visible in every frame. Plain pure white background. No text, no numbers, no frame borders, no shadows, no extra objects.
```

---

## 1. 가만히 있을 때 (idle) — 현재 가장 필요
```
[공통 머리말]
Animation: standing idle and breathing. Frame 1: standing straight, paws together at chest, calm smile. Frame 2: body slightly puffed up as if inhaling, head tilted a little to the left. Frame 3: eyes closed in a blink, paws together. Frame 4: looking a little to the right, tail lifted slightly. Very subtle differences between frames; feet stay in the same place.
```
한글: 숨 쉬기·눈 깜빡임·고개 살짝 돌리기. 발 위치는 그대로.

## 2. 간식 먹기 (eat)
```
[공통 머리말]
Animation: eating an acorn. Frame 1: holding an acorn with both paws near the chest, mouth closed. Frame 2: acorn raised to the mouth, cheeks slightly puffed, eyes happy and closed. Frame 3: chewing, cheeks puffed, acorn a little smaller. Frame 4: acorn lowered, mouth closed, content smile. Feet stay in the same place.
```

## 3. 잠 (sleep)
```
[공통 머리말]
Animation: sleeping curled up on the ground. Frame 1: curled up with eyes closed, tail wrapped around the body. Frame 2: same pose, body slightly bigger as if breathing in. Frame 3: same pose with a small "z" shaped sleep bubble is NOT needed; instead one ear twitches slightly. Frame 4: same as frame 1. Keep all four frames nearly identical except the breathing.
```
한글: 네 장이 거의 똑같고 숨쉬기만 다르게. (코드가 아주 천천히 넘깁니다.)

## 4. 걷기 다시 만들기 (walk) — 선택
지금 넣은 걷기 그림이 기본 포즈보다 살짝 통통해서, 통일하고 싶을 때만.
```
[공통 머리말]
Animation: a 4-frame walk cycle, walking toward the right side of the image, body facing three-quarter right. Frame 1: left foot forward, right arm forward. Frame 2: feet passing, body slightly higher. Frame 3: right foot forward, left arm forward. Frame 4: feet passing, body slightly lower. Keep the body size identical in all frames.
```

## 5. 기쁨·만세 다시 만들기 (cheer) — 선택
```
[공통 머리말]
Animation: cheering with joy, facing front. Frame 1: both arms raised high, mouth open in a big smile. Frame 2: arms halfway down, small hop with feet just off the ground. Frame 3: arms raised high again, body a little higher in the air. Frame 4: arms lowered, landed, big smile. Keep the body size identical in all frames.
```

---

## 6. 아기 · 어린이 · 청소년 단계용
참고 이미지를 `pet_baby.png` / `pet_child.png` / `pet_teen.png` 로 바꿔서 위 1~5번 프롬프트를 그대로 쓰면 됩니다. 머리말의 첫 문장만 아래처럼 바꾸세요.

- 아기: `Use the attached image as the exact character reference: a cute chibi BABY pygmy squirrel hugging a small acorn, ...`
- 어린이: `... a cute chibi young pygmy squirrel wearing a small yellow backpack, ...`
- 청소년: `... a cute chibi teenage pygmy squirrel wearing a red bandana scarf, ...`

받은 시트 이름: `sheet_baby_walk.png`, `sheet_child_cheer.png` 처럼 `sheet_<단계>_<동작>.png`

## 7. 전설 단계 (legend) — 한 장짜리
아직 없는 마지막 성장 단계입니다. 프레임이 아니라 한 장이면 됩니다.
```
Use the attached image as the exact character reference (same chibi pygmy squirrel, same style, colors and face). Draw the LEGENDARY final form of this character: standing proudly facing front, wearing a small golden crown and a short red cape, with a soft golden glow and a few sparkles around the body. Same proportions as the reference, full body visible, square image, plain pure white background, no text, no shadows.
```
파일 이름: `assets/pet_legend.png` (정사각형, 투명 배경이면 더 좋음. 흰 배경이면 제가 투명하게 바꿉니다.)

---

## 결과가 이상할 때
- 4마리가 겹치거나 크기가 다름 → 문장 끝에 `Each of the 4 frames must be the same size, separated by clear white gaps.` 추가
- 그림체가 바뀜 → `Do not change the art style; match the reference exactly.` 추가
- 프레임이 3개나 5개로 나옴 → `exactly 4 frames` 를 두 번 써 주세요
- 배경에 색이나 무늬가 생김 → `solid white background #FFFFFF` 로 바꿔 보세요
