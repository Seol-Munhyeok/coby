## ChatWindow.jsx

이 파일은 애플리케이션의 채팅 기능을 담당하는 React 컴포넌트인 `ChatWindow`를 정의합니다. 실시간 웹소켓 연동을 고려하여 메시지 목록과 전송 기능을 분리하여 구현되었습니다.

### 주요 기능

* **채팅 메시지 표시:** `messages` prop으로 전달된 메시지 목록을 렌더링합니다. 각 메시지는 발신자와 내용, 그리고 필요에 따라 아바타를 포함합니다.
* **메시지 전송:** 사용자가 입력 필드에 메시지를 작성하고 전송할 수 있습니다. 엔터 키 또는 전송 버튼 클릭 시 `onSendMessage` 콜백 함수를 통해 메시지를 상위 컴포넌트로 전달합니다.
* **자동 스크롤:** 새로운 메시지가 추가될 때마다 채팅창이 자동으로 가장 아래로 스크롤됩니다.
* **플레이어 아바타 표시:** 메시지 발신자에 따라 플레이어의 아바타와 색상을 표시합니다.

### 컴포넌트 Props

* `messages`: 표시할 메시지 객체 배열. 각 객체는 `sender` (발신자 닉네임)와 `text` (메시지 내용)를 포함해야 합니다.
* `onSendMessage`: 메시지 전송 시 호출될 콜백 함수. 입력된 메시지 문자열을 인자로 받습니다.
* `currentUser`: 현재 채팅을 사용하는 사용자의 닉네임.
* `playerData`: 각 플레이어의 아바타 색상과 이니셜 정보를 담고 있는 객체. `sender`를 키로 사용합니다.

### State 변수 (`useState`)

* `inputMessage`: 채팅 입력 필드의 현재 값.

### Ref 변수 (`useRef`)

* `chatMessagesRef`: 채팅 메시지 목록이 스크롤되는 `div` 요소를 참조합니다. 자동 스크롤 기능 구현에 사용됩니다.

### 주요 함수 (`function`)

* `handleInputChange(e)`: 입력 필드의 값이 변경될 때 `inputMessage` 상태를 업데이트합니다.
* `handleSendClick()`: "보내기" 버튼 클릭 시 또는 엔터 키 입력 시 `onSendMessage` 콜백을 호출하고 `inputMessage`를 초기화합니다.
* `handleKeyPress(e)`: 키보드 입력 이벤트 핸들러. 'Enter' 키가 눌리면 `handleSendClick`을 호출합니다.

### `useEffect` 훅의 활용

* **메시지 스크롤:** `messages` prop이 변경될 때마다 채팅 메시지 컨테이너를 가장 아래로 스크롤하여 최신 메시지가 보이도록 합니다.

### CSS 파일

* `ChatWindow.css`: 컴포넌트의 시각적 스타일링을 담당합니다.

### 의존성

* `react`

---

## PieChart.jsx

이 파일은 `react-chartjs-2` 라이브러리를 사용하여 원형(파이) 차트를 렌더링하는 React 컴포넌트인 `PieChart`를 정의합니다. 주로 통계 데이터, 특히 비율을 시각화하는 데 사용됩니다.

### 주요 기능

* **원형 차트 렌더링:** `Chart.js`를 기반으로 파이 차트를 생성하고 표시합니다.
* **데이터 주입:** `data` prop을 통해 차트에 표시될 데이터를 동적으로 받아서 렌더링합니다.
* **반응형 디자인:** 부모 컨테이너에 맞춰 차트 크기가 자동으로 조절됩니다.
* **범례 표시:** 차트 데이터에 대한 범례를 제공합니다 (기본 위치: 오른쪽).
* **툴팁:** 마우스 오버 시 각 섹션의 상세 정보를 보여주는 툴팁을 활성화합니다.
* **데이터 라벨:** 각 섹션의 값을 백분율로 표시하는 데이터 라벨 플러그인(`chartjs-plugin-datalabels`)을 사용합니다.

### 컴포넌트 Props

* `data`: 차트를 렌더링하는 데 필요한 데이터를 담는 객체. `labels` 배열과 `datasets` 배열을 포함해야 합니다.

### `Chart.js` 기능 등록

* `ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);`
    * **`ArcElement`**: 파이 차트의 각 섹션(호)을 그리는 데 필요합니다.
    * **`Tooltip`**: 마우스 오버 시 정보를 표시하는 툴팁 기능을 제공합니다.
    * **`Legend`**: 차트 범례를 표시합니다.
    * **`ChartDataLabels`**: 각 섹션에 직접 데이터 라벨을 표시하는 플러그인입니다.

    **주의:** `Chart.js`의 기능 등록은 일반적으로 애플리케이션의 진입점(`index.js` 등)에서 한 번만 수행하는 것이 권장됩니다. 이 컴포넌트 내부에 포함된 것은 예시를 위한 것입니다.

### 차트 옵션 (`options`)

* `responsive: true`: 차트가 부모 컨테이너 크기에 맞춰 반응형으로 동작하도록 합니다.
* `maintainAspectRatio: false`: 차트가 부모 컨테이너에 맞춰질 때 가로세로 비율을 유지하지 않도록 합니다.
* `plugins`:
    * `legend.position`: 범례의 위치를 설정합니다 (`'right'`).
    * `tooltip.enabled`: 툴팁 활성화 여부를 설정합니다 (`true`).
    * `datalabels.formatter`: 데이터 라벨의 형식을 지정하는 콜백 함수. 각 데이터 값을 전체 합계에 대한 백분율로 변환하여 표시합니다.

### 의존성

* `react`
* `chart.js`, `react-chartjs-2`, `chartjs-plugin-datalabels`

---

## PlayerInfoModal.jsx

이 파일은 플레이어의 상세 정보를 표시하는 모달 컴포넌트인 `PlayerInfoModal`을 정의합니다. 다른 플레이어의 프로필을 클릭했을 때 해당 플레이어의 통계, 최근 기록, 선호 문제 유형 등을 보여줍니다.

### 주요 기능

* **모달 표시 제어:** `showModal` prop에 따라 모달을 열고 닫습니다.
* **플레이어 정보 표시:** `playerData` prop으로 전달된 객체에서 플레이어의 닉네임, 상태 메시지, 아바타, 랭킹 포인트, 승/패 기록 등을 추출하여 표시합니다.
* **최근 게임 기록:** `playerData.recentGames` 배열을 기반으로 최근 플레이한 게임 목록을 동적으로 렌더링합니다. 각 기록은 문제 이름, 결과(승/패), 소요 시간, 날짜를 포함합니다.
* **선호 문제 유형 차트:** `playerData.preferredTypes` 데이터를 사용하여 `PieChart` 컴포넌트를 렌더링하여 플레이어의 선호 문제 유형 비율을 시각적으로 보여줍니다.
* **닫기 버튼:** 모달 외부를 클릭하거나 닫기 버튼 클릭 시 `onClose` 콜백 함수를 호출하여 모달을 닫습니다.

### 컴포넌트 Props

* `showModal`: 모달의 표시 여부를 제어하는 boolean 값.
* `onClose`: 모달이 닫힐 때 호출될 콜백 함수.
* `playerData`: 표시할 플레이어의 모든 정보를 담고 있는 객체. 닉네임, 상태 메시지, 아바타, 랭킹, 승리/패배, 최근 게임, 선호 유형 등의 속성을 포함합니다.
* `selectedPlayerName`: 현재 선택된 플레이어의 이름 (모달 제목에 사용될 수 있습니다).

### State 변수 (`useState`)

* `chartData`: `PieChart` 컴포넌트에 전달될 데이터를 관리하는 상태. `playerData.preferredTypes`가 변경될 때마다 업데이트됩니다.

### 상수

* `TYPE_COLORS`: 문제 유형 이름에 따른 일관된 색상 매핑을 정의하는 객체. 파이 차트의 배경색 설정에 사용됩니다.

### 주요 함수 (`function`)

* `renderRecentGames(games)`: `playerData.recentGames` 배열을 순회하며 각 게임 기록을 JSX 요소로 변환하여 렌더링합니다.

### `useEffect` 훅의 활용

* **차트 데이터 업데이트:** `playerData` prop이 변경될 때마다 `playerData.preferredTypes`를 기반으로 `chartData` 상태를 업데이트합니다. 이로 인해 `PieChart`가 재렌더링됩니다.

### CSS 파일

* `PlayerInfoModal.css`: 컴포넌트의 스타일링을 담당하는 CSS 파일입니다. (`waitingRoom-glass-effect`, `waitingRoom-custom-scrollbar` 등의 클래스를 사용)

### 의존성

* `react`
* `./PieChart` (하위 컴포넌트)

---

## ToastNotification.jsx

이 파일은 사용자에게 성공, 오류 또는 정보 메시지를 표시하는 작은 팝업 알림 컴포넌트인 `ToastNotification`을 정의합니다. 일정 시간 후 자동으로 사라지는 특징을 가집니다.

### 주요 기능

* **메시지 표시:** `message` prop으로 전달된 텍스트를 사용자에게 보여줍니다.
* **타입별 스타일링:** `type` prop에 따라 배경색과 아이콘을 변경하여 시각적으로 메시지의 중요도나 종류를 구분합니다 (`'success'`는 초록색 체크마크, 그 외는 빨간색 경고/오류 아이콘).
* **자동 닫힘:** 3초 후에 자동으로 팝업이 사라집니다.
* **수동 닫기:** (현재 구현되지 않았으나, `onClose` prop을 통해 외부에서 제어 가능)

### 컴포넌트 Props

* `message`: 토스트 알림에 표시될 텍스트 내용.
* `type`: 토스트 알림의 종류를 나타내는 문자열 (예: `'success'`, `'error'`, `'info'`). 이에 따라 스타일과 아이콘이 달라집니다.
* `onClose`: 토스트 알림이 닫힐 때 호출될 콜백 함수.

### 주요 상수

* `bgColor`: `type`에 따라 토스트 알림의 배경색을 결정하는 CSS 클래스 (`bg-green-500` 또는 `bg-red-500`).
* `icon`: `type`에 따라 토스트 알림 내부에 표시될 SVG 아이콘.

### `useEffect` 훅의 활용

* **자동 닫힘 타이머:** 컴포넌트가 렌더링될 때 `setTimeout`을 설정하여 3초 후 `onClose` 콜백 함수를 호출합니다. 컴포넌트가 언마운트되거나 `onClose`가 변경되면 기존 타이머를 정리합니다.

### CSS 파일

* `ToastNotification.css`: 컴포넌트의 스타일링 및 애니메이션을 담당합니다.

### 의존성

* `react`

---

## useContextMenu.js

이 파일은 플레이어 카드와 관련된 우클릭(컨텍스트 메뉴) 로직을 추상화한 커스텀 훅인 `useContextMenu`를 정의합니다. 이는 플레이어 카드에 대한 우클릭 메뉴의 표시 여부, 위치, 선택된 플레이어 등을 관리하는 데 사용됩니다.

### 주요 기능

* **컨텍스트 메뉴 표시 상태 관리:** 우클릭 메뉴의 가시성(`showContextMenu`)을 제어합니다.
* **컨텍스트 메뉴 위치 설정:** 우클릭이 발생한 마우스 좌표(`contextMenuPos`)를 저장하여 메뉴를 정확한 위치에 표시할 수 있도록 합니다.
* **선택된 플레이어 관리:** 우클릭된 플레이어의 정보(`selectedPlayer`)를 저장합니다.
* **외부 클릭 감지:** 컨텍스트 메뉴 외부를 클릭했을 때 메뉴가 자동으로 닫히도록 합니다.

### Hook 반환 값

`useContextMenu` 훅은 다음 값들을 객체 형태로 반환합니다:

* `showContextMenu`: 현재 컨텍스트 메뉴가 표시되고 있는지 여부 (boolean).
* `contextMenuPos`: 컨텍스트 메뉴가 표시될 {x, y} 좌표 (객체).
* `selectedPlayer`: 우클릭된 플레이어의 정보 (객체 또는 `null`).
* `contextMenuRef`: 컨텍스트 메뉴 DOM 요소를 참조하기 위한 `ref` 객체. 외부 클릭 감지 로직에서 사용됩니다.
* `handlePlayerCardClick(event, player)`: 플레이어 카드를 우클릭했을 때 호출될 이벤트 핸들러. 메뉴 표시 상태와 위치, 선택된 플레이어 정보를 업데이트합니다. `event.preventDefault()`를 호출하여 브라우저 기본 컨텍스트 메뉴를 방지합니다.
* `setShowContextMenu(boolean)`: `showContextMenu` 상태를 수동으로 설정하는 함수.
* `setSelectedPlayer(player)`: `selectedPlayer` 상태를 수동으로 설정하는 함수.

### 주요 함수 (`function`)

* `handlePlayerCardClick(event, player)`: 플레이어 카드에 대한 `onContextMenu` 이벤트에 연결될 함수입니다. `event`와 해당 `player` 객체를 인자로 받습니다.
* `handleClickOutside(event)`: `document`에 등록되는 이벤트 리스너. 클릭 이벤트가 컨텍스트 메뉴 외부에서 발생했는지 확인하고, 그렇다면 메뉴를 닫습니다.

### `useEffect` 훅의 활용

* **외부 클릭 이벤트 리스너 등록/해제:** 컴포넌트가 마운트될 때 `mousedown` 이벤트 리스너를 `document`에 등록하여 컨텍스트 메뉴 외부 클릭을 감지합니다. 컴포넌트가 언마운트될 때는 리스너를 정리하여 메모리 누수를 방지합니다.

### 의존성

* `react`