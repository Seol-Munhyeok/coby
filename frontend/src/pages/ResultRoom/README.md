# ResultRoom.jsx

이 파일은 COBY 애플리케이션의 결과 화면을 담당하는 React 컴포넌트인 `ResultRoom`을 정의합니다. 코딩 배틀이 종료된 후, 최종 결과를 표시하고 참가자들의 정보 확인 및 채팅 기능을 제공합니다.

## 주요 기능

* **배틀 결과 표시:** 게임 결과(승/패/무승부), 각 플레이어의 최종 코드, 소요 시간, 랭킹 변동 등을 시각적으로 보여줍니다.
* **플레이어 카드:** 참가자들의 닉네임, 프로필 사진, 랭킹 포인트 등 요약 정보를 카드 형태로 표시합니다.
* **컨텍스트 메뉴:** 플레이어 카드를 우클릭했을 때 나타나는 메뉴를 통해 해당 플레이어의 상세 정보(`PlayerInfoModal`)를 볼 수 있습니다.
* **채팅 기능:** `ChatWindow` 컴포넌트를 통해 실시간 채팅을 지원합니다.
* **토스트 알림:** WebSocket 연결 상태나 오류 등 중요한 알림을 토스트 팝업으로 사용자에게 전달합니다.
* **결과 상세 모달:** "내 결과 상세 보기" 버튼을 클릭하면 자신의 최종 코드, 실행 결과 등을 보여주는 모달이 열립니다.
* **재매칭/메인 페이지 이동:** 배틀 종료 후 재매칭을 시도하거나 메인 페이지로 돌아갈 수 있는 버튼을 제공합니다.
* **로딩 스피너:** 결과 로딩 중임을 나타내는 스피너 애니메이션을 표시합니다.

## 컴포넌트 구조 및 상태 관리

`ResultRoom` 컴포넌트는 `useState`, `useEffect` 훅과 함께 `useWebSocket`, `useContextMenu`와 같은 커스텀 훅을 활용하여 복잡한 상태와 사이드 이펙트를 관리합니다.

### State 변수 (`useState`)

* `notification`: `ToastNotification` 컴포넌트에 전달될 알림 메시지와 타입(`{ message: string, type: string }` 형태)을 관리합니다.
* `showPlayerInfoModal`: `PlayerInfoModal`의 열림 상태를 제어합니다.
* `playerInfoForModal`: `PlayerInfoModal`에 전달될 특정 플레이어의 상세 정보를 담는 객체.
* `showMyResultModal`: "내 결과 상세 보기" 모달의 열림 상태를 제어합니다.
* `myResultData`: "내 결과 상세 보기" 모달에 표시될 현재 사용자의 결과 데이터를 담는 객체.
* `loading`: 결과 데이터를 로딩 중인지 여부를 나타내는 boolean 값.
* `playerData`: 현재 방에 있는 모든 플레이어의 정보를 담는 객체 배열. (예시 데이터 포함)
* `myPlayerData`: 현재 사용자의 정보 (예시 데이터 포함).

### `useWebSocket` 훅의 활용

* `messages`: WebSocket을 통해 수신된 채팅 메시지 목록.
* `sendMessage`: WebSocket을 통해 메시지를 전송하는 함수.
* `isConnected`: WebSocket 연결 상태 (boolean).
* `error`: WebSocket 연결 오류 메시지.

### `useContextMenu` 훅의 활용

* `showContextMenu`: 컨텍스트 메뉴의 표시 여부.
* `contextMenuPos`: 컨텍스트 메뉴의 x, y 좌표.
* `selectedPlayer`: 우클릭된 플레이어의 정보.
* `contextMenuRef`: 컨텍스트 메뉴 DOM 요소를 참조하는 `ref`.
* `handlePlayerCardClick`: 플레이어 카드 우클릭 이벤트 핸들러. 메뉴를 열고 위치를 설정하며 `selectedPlayer`를 업데이트합니다.
* `setShowContextMenu`, `setSelectedPlayer`: 컨텍스트 메뉴 상태를 수동으로 제어하는 함수들.

### 주요 함수 (`function`)

* `handleSendMessage(newMessage)`: `useWebSocket` 훅의 `sendMessage` 함수를 사용하여 새 채팅 메시지를 전송합니다.
* `showMyResultModal(data)`: "내 결과 상세 보기" 모달을 열고 `myResultData` 상태를 설정합니다.
* `closeMyResultModal()`: "내 결과 상세 보기" 모달을 닫습니다.
* `handleRematch()`: "재매칭" 버튼 클릭 시 호출됩니다. (현재는 알림만 표시)
* `handleGoToMain()`: "메인으로" 버튼 클릭 시 호출됩니다. 메인 페이지로 이동합니다.

### `useEffect` 훅의 활용

* **WebSocket 연결 알림:** `isConnected` 또는 `error` 상태 변화에 따라 `ToastNotification`을 표시합니다. 알림은 3초 후 자동으로 사라집니다.
* **로딩 상태 관리:** 컴포넌트 마운트 시 2초간 로딩 상태를 보여준 후 실제 결과를 표시합니다.
* **PlayerInfoModal 데이터 업데이트:** 컨텍스트 메뉴에서 "정보 보기"를 클릭했을 때 `selectedPlayer` 정보를 바탕으로 `playerInfoForModal`을 설정하고 모달을 엽니다.

## UI 요소 및 상호작용

* **결과 헤더:** "결과" 제목, 승/패/무승부 텍스트.
* **플레이어 목록:** 각 플레이어를 나타내는 카드들의 그리드.
    * 각 카드에 플레이어의 닉네임, 랭킹, K.O. 횟수, 랭킹 변동 등이 표시됩니다.
    * 우클릭 시 `useContextMenu` 훅을 통해 컨텍스트 메뉴가 표시됩니다.
* **내 결과 상세 보기 버튼:** 클릭 시 `showMyResultModal` 함수를 호출하여 자신의 상세 결과를 보여주는 모달을 엽니다.
* **하단 액션 버튼:**
    * "재매칭": `handleRematch` 함수 호출.
    * "메인으로": `handleGoToMain` 함수 호출.
* **ChatWindow 컴포넌트:** 실시간 채팅 인터페이스.
* **PlayerInfoModal 컴포넌트:** 다른 플레이어의 상세 정보를 보여주는 모달.
* **ToastNotification 컴포넌트:** WebSocket 연결 상태 등의 알림을 표시.
* **Custom Context Menu:** `useContextMenu` 훅과 연동되어 플레이어 카드 우클릭 시 표시되는 메뉴.

## CSS 파일

* `ResultRoom.css`: 컴포넌트의 스타일링을 담당하는 CSS 파일입니다.
* `waitingRoom-glass-effect`, `waitingRoom-custom-scrollbar`: 재사용되는 공통 스타일 클래스.

## 의존성

* `react`, `react-router-dom`
* `../../Common/components/ChatWindow`
* `../../Common/hooks/useContextMenu`
* `../../Common/components/PlayerInfoModal`
* `../WebSocket/WebSocketContext` (`useWebSocket` 커스텀 훅)
* `../../Common/components/ToastNotification`