## RoomSettingsModal.jsx

이 파일은 방 설정을 변경할 수 있는 모달 컴포넌트인 `RoomSettingsModal`을 정의합니다. 방장은 이 모달을 통해 방 이름, 문제 유형, 난이도, 시간 제한, 최대 참가자 수, 비밀방 여부 및 비밀번호를 설정할 수 있습니다.

### 주요 기능

* **방 설정 변경:** 방 이름, 문제 유형, 난이도, 시간 제한, 최대 참가자 수 등 다양한 방 속성을 수정할 수 있습니다.
* **비밀방 설정:** 방을 비공개로 설정하고 비밀번호를 지정할 수 있습니다.
* **유효성 검사:**
    * 방 이름이 비어있는지 확인합니다.
    * 비밀방일 경우 비밀번호가 비어있는지 확인합니다.
    * 최대 참가자 수가 현재 참가자 수보다 적게 설정되는 것을 방지합니다.
* **초기 설정 로드:** 모달이 열릴 때마다 `initialSettings` prop으로 전달된 초기 설정 값을 로드합니다.
* **설정 저장 및 취소:** "저장" 버튼 클릭 시 유효성 검사 후 `onSave` 콜백 함수를 호출하고, "취소" 버튼 클릭 시 `onClose` 콜백 함수를 호출하여 모달을 닫습니다.

### 컴포넌트 Props

* `showModal`: 모달의 표시 여부를 제어하는 boolean 값.
* `onClose`: 모달이 닫힐 때 호출될 콜백 함수.
* `onSave`: 설정이 저장될 때 호출될 콜백 함수. 변경된 `settings` 객체를 인자로 받습니다.
* `initialSettings`: 모달이 열렸을 때 로드될 초기 방 설정 객체. `roomName`, `problemType`, `difficulty`, `timeLimit`, `maxParticipants`, `isPrivate`, `password` 등의 속성을 포함합니다.
* `currentParticipantsCount`: 현재 방에 참여하고 있는 참가자 수. 최대 참가자 수 유효성 검사에 사용됩니다.

### State 변수 (`useState`)

* `settings`: 현재 모달에서 사용자가 변경하고 있는 방 설정 값들을 담는 객체.

### 주요 함수 (`function`)

* `handleChange(e)`: 입력 필드나 체크박스의 값이 변경될 때 `settings` 상태를 업데이트합니다. `maxParticipants`의 경우 정수형으로 변환합니다.
* `handleSave()`: "저장" 버튼 클릭 시 호출됩니다. 유효성 검사를 수행하고, 모든 검사를 통과하면 `onSave` 콜백을 호출합니다.

### `useEffect` 훅의 활용

* **초기 설정 로드:** `showModal` 또는 `initialSettings` prop이 변경될 때마다 `settings` 상태를 `initialSettings`로 재설정하여 모달이 항상 최신 또는 초기 설정으로 시작하도록 합니다.

### CSS 파일

* 해당 컴포넌트에는 직접적인 CSS 파일 임포트가 보이지 않지만, Tailwind CSS 클래스 및 부모 컴포넌트 (`WaitingRoom.jsx`)의 스타일을 재사용하는 것으로 예상됩니다. (`waitingRoom-glass-effect`, `waitingRoom-text` 등).

### 의존성

* `react`

---

## PlayerCard.jsx

이 파일은 대기실이나 결과 화면 등에서 개별 플레이어의 정보를 간략하게 표시하는 React 컴포넌트인 `PlayerCard`를 정의합니다. 플레이어가 존재하지 않는 '빈 자리' 카드도 함께 렌더링합니다.

### 주요 기능

* **플레이어 정보 표시:** 플레이어의 닉네임, 아바타 이니셜 및 색상, 티어, 레벨, 랭킹 포인트 등 요약 정보를 시각적으로 제공합니다.
* **방장 표시:** `isHost` 속성에 따라 방장인 플레이어 카드에 특별한 시각적 표시(`host` 클래스)를 추가합니다.
* **빈 자리 표시:** `isEmpty` 속성을 통해 플레이어가 없는 '빈 자리' 카드를 렌더링합니다. 이 경우 아바타와 닉네임 대신 빈 자리 아이콘과 텍스트가 표시되며, 카드의 투명도가 낮아집니다.
* **클릭 및 우클릭 이벤트 핸들링:** 카드 클릭(`onClick`) 및 우클릭(`onContextMenu`) 시 `handlePlayerCardClick` 콜백 함수를 호출하여 상위 컴포넌트에서 플레이어 선택 및 컨텍스트 메뉴 표시 로직을 처리할 수 있도록 합니다.

### 컴포넌트 Props

* `player`: 표시할 플레이어의 정보를 담는 객체. 다음 속성들을 포함할 수 있습니다:
    * `isEmpty`: (boolean) 빈 자리 카드인지 여부.
    * `name`: (string) 플레이어 닉네임.
    * `isHost`: (boolean) 방장인지 여부.
    * `avatarColor`: (string) 아바타 배경색 CSS 클래스 (예: `'bg-blue-700'`).
    * `avatarInitials`: (string) 아바타에 표시될 이니셜.
    * `tier`: (string) 플레이어의 티어.
    * `rankPoints`: (number) 랭킹 포인트.
* `handlePlayerCardClick`: 플레이어 카드 클릭 또는 우클릭 시 호출될 콜백 함수. 이벤트 객체와 `player` 객체를 인자로 받습니다.

### CSS 파일

* `../WaitingRoom.css`: 이 컴포넌트의 스타일링을 위해 `WaitingRoom.css` 파일의 클래스들을 사용합니다. (`waitingRoom-player-card`, `waitingRoom-glass-effect`, `waitingRoom-character`, `waitingRoom-tier-badge`, `waitingRoom-text` 등).

### 의존성

* `react`

---

## WaitingRoom.jsx

이 파일은 코딩 배틀의 게임 대기방을 구현하는 React 컴포넌트인 `WaitingRoom`을 정의합니다. 플레이어들은 이 방에서 다른 참가자들을 기다리고, 채팅을 하며, 방 설정을 변경하고 게임을 시작할 수 있습니다.

### 주요 기능

* **플레이어 목록 표시:** `PlayerCard` 컴포넌트를 사용하여 현재 방에 있는 모든 플레이어와 빈 자리를 표시합니다.
* **채팅 기능:** `ChatWindow` 컴포넌트를 통해 참가자들 간의 실시간 채팅을 지원합니다.
* **방 설정 관리:** 방장(호스트)은 `RoomSettingsModal`을 통해 방 이름, 문제 유형, 난이도, 시간 제한, 최대 참가자 수, 비밀방 여부 등을 변경할 수 있습니다.
* **플레이어 정보 및 상호작용:**
    * 플레이어 카드를 우클릭하여 컨텍스트 메뉴를 표시하고, 해당 플레이어의 상세 정보(`PlayerInfoModal`)를 볼 수 있습니다.
    * 방장일 경우, 컨텍스트 메뉴를 통해 다른 플레이어에게 방장 권한을 위임하거나 강퇴할 수 있습니다.
* **게임 시작:** 방장이 모든 설정이 완료되고 충분한 인원이 모이면 게임을 시작할 수 있습니다.
* **방 나가기:** 방을 떠날 수 있는 버튼을 제공합니다.
* **WebSocket 통신:** `useWebSocket` 훅을 사용하여 실시간 채팅 및 방 상태 업데이트를 위한 서버와의 통신을 관리합니다.
* **토스트 알림:** WebSocket 연결 상태, 방 설정 변경 성공/실패, 강퇴 등 다양한 이벤트에 대한 알림을 토스트 팝업으로 사용자에게 전달합니다.

### 컴포넌트 구조 및 상태 관리

`WaitingRoom` 컴포넌트는 `useState`, `useEffect`, `useRef` 훅을 비롯해 `useContextMenu`, `useWebSocket`과 같은 다양한 커스텀 훅과 하위 컴포넌트들을 유기적으로 활용하여 복잡한 대기방 로직을 구현합니다.

### State 변수 (`useState`)

* `isRoomSettingsModalOpen`: 방 설정 모달의 열림 상태를 제어합니다.
* `showPlayerInfoModal`: 플레이어 정보 모달의 열림 상태를 제어합니다.
* `playerInfoForModal`: `PlayerInfoModal`에 전달될 특정 플레이어의 상세 정보를 담는 객체.
* `roomName`, `problemType`, `difficulty`, `timeLimit`, `maxParticipants`, `isPrivate`, `password`: 현재 방의 설정 값들을 관리합니다.
* `notification`: `ToastNotification` 컴포넌트에 전달될 알림 메시지와 타입.
* `currentUser`: 현재 로그인된 사용자의 닉네임 (예시 값).
* `currentPlayers`: 현재 방에 참여 중인 플레이어들의 배열. (예시 데이터 포함)
* `isCurrentUserHost`: 현재 사용자가 방장인지 여부 (boolean). (예시 값)

### `useWebSocket` 훅의 활용

* `messages`: WebSocket을 통해 수신된 채팅 메시지 목록.
* `sendMessage`: WebSocket을 통해 메시지를 전송하는 함수.
* `isConnected`: WebSocket 연결 상태 (boolean).
* `error`: WebSocket 연결 오류 메시지.

### `useContextMenu` 훅의 활용

* `showContextMenu`, `contextMenuPos`, `selectedPlayer`, `contextMenuRef`: 컨텍스트 메뉴의 표시 상태, 위치, 선택된 플레이어 및 참조를 관리합니다.
* `handlePlayerCardClick`: `PlayerCard`에 전달되는 우클릭 이벤트 핸들러.
* `setShowContextMenu`, `setSelectedPlayer`: 컨텍스트 메뉴 상태를 수동으로 제어하는 함수들.

### 주요 함수 (`function`)

* `handleSendMessage(newMessage)`: `useWebSocket` 훅의 `sendMessage` 함수를 사용하여 새 채팅 메시지를 전송합니다.
* `openRoomSettingsModal()`: 방 설정 모달을 엽니다.
* `handleSaveRoomSettings(newSettings)`: `RoomSettingsModal`에서 설정이 저장될 때 호출됩니다. `roomName` 등의 방 설정 상태를 업데이트하고 알림을 표시합니다.
* `handleDelegateHost()`: 컨텍스트 메뉴에서 "방장 위임" 클릭 시 호출됩니다. `selectedPlayer`에게 방장 권한을 위임합니다.
* `handleKickPlayer()`: 컨텍스트 메뉴에서 "강퇴하기" 클릭 시 호출됩니다. `selectedPlayer`를 방에서 강퇴합니다.
* `handleStartGame()`: "게임 시작" 버튼 클릭 시 호출됩니다. 현재는 알림만 표시하고 `/battle` 경로로 이동합니다.
* `handleExitRoom()`: "방 나가기" 버튼 클릭 시 호출됩니다. 메인 페이지로 이동합니다.

### `useEffect` 훅의 활용

* **WebSocket 연결 알림:** `isConnected` 또는 `error` 상태 변화에 따라 `ToastNotification`을 표시합니다.
* **PlayerInfoModal 데이터 업데이트:** `selectedPlayer` 상태가 변경될 때마다 `playerInfoForModal`을 설정하고 `PlayerInfoModal`을 표시합니다.

## UI 요소 및 상호작용

* **방 정보 패널:** 방 이름, 현재 참가자 수/최대 참가자 수, 문제 유형, 난이도, 시간 제한 등을 표시합니다. 방장일 경우 설정 변경 버튼이 나타납니다.
* **플레이어 카드 그리드:** `PlayerCard` 컴포넌트들을 사용하여 참가자 목록을 시각적으로 보여줍니다.
* **하단 액션 버튼:** "방 나가기", "게임 시작" 버튼.
* **ChatWindow 컴포넌트:** 실시간 채팅 인터페이스.
* **RoomSettingsModal 컴포넌트:** 방 설정 변경을 위한 모달.
* **PlayerInfoModal 컴포넌트:** 플레이어 상세 정보를 보여주는 모달.
* **Custom Context Menu:** `useContextMenu` 훅과 연동되어 플레이어 카드 우클릭 시 표시되는 메뉴.
* **ToastNotification 컴포넌트:** 다양한 이벤트 알림을 표시.

## CSS 파일

* `WaitingRoom.css`: 컴포넌트의 전반적인 스타일링을 담당하는 CSS 파일입니다. (`waitingRoom-glass-effect`, `waitingRoom-text`, `waitingRoom-custom-scrollbar` 등).

## 의존성

* `react`, `react-router-dom`
* `../../Common/hooks/useContextMenu`
* `./components/PlayerCard`
* `../../Common/components/PlayerInfoModal`
* `../../Common/components/ChatWindow`
* `./components/RoomSettingsModal`
* `../../Common/components/ToastNotification`
* `../WebSocket/WebSocketContext` (`useWebSocket` 커스텀 훅)