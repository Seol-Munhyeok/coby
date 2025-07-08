# MainPage.jsx

이 파일은 COBY 애플리케이션의 메인 페이지를 구현하는 React 컴포넌트인 `MainPage`를 정의합니다. 사용자는 이 페이지에서 새로운 코딩 배틀 룸을 생성하거나, 기존 룸에 참여할 수 있습니다.

## 주요 기능

* **방 생성:** 새로운 코딩 배틀 룸을 생성할 수 있는 모달을 제공합니다.
* **방 참여:** 기존 룸에 입장 코드를 입력하여 참여할 수 있습니다.
* **룸 관리:** 생성된 룸의 정보를 표시하고, 입장 코드를 공유하거나 복사할 수 있습니다.
* **페이지 이동:** 게임 대기방(`waitingRoom`)으로 이동하는 기능을 제공합니다.

## 컴포넌트 구조 및 상태 관리

`MainPage` 컴포넌트는 `useState`와 `useRef` 훅을 활용하여 모달 상태, 입력 필드 참조 등을 관리합니다.

### State 변수 (`useState`)

* `isCreateModalOpen`: 방 만들기 모달의 열림 상태를 제어합니다.
* `isRoomCreatedModalOpen`: 방 생성 완료 모달의 열림 상태를 제어합니다.

### Ref 변수 (`useRef`)

* `inputRef`: 방 제목 입력 필드를 참조합니다.

### 주요 함수 (`function`)

* `openCreateRoomModal()`: "방 만들기" 모달을 엽니다.
* `closeCreateRoomModel()`: "방 만들기" 모달을 닫습니다.
* `confirmCreateRoom()`: 방 제목을 검사한 후, 유효하면 "방 만들기" 모달을 닫고 "생성 완료" 모달을 엽니다.
* `closeCreatedRoomModel()`: "생성 완료" 모달을 닫습니다.
* `enterRoomBtn()`: 사용자에게 알림을 표시하고 게임 대기방(`waitingRoom`)으로 이동합니다.
* `handleRoomJoin()`: "참여하기" 버튼 클릭 시, 사용자에게 알림을 표시하고 게임 대기방(`waitingRoom`)으로 이동합니다.

## UI 요소 및 상호작용

* **방 만들기 버튼:** 클릭 시 `isCreateModalOpen` 상태를 `true`로 설정하여 방 만들기 모달을 엽니다.
* **방 참여하기 버튼:** 클릭 시 `handleRoomJoin` 함수를 호출합니다.
* **"방 만들기" 모달:**
    * 방 제목을 입력할 수 있는 `<input>` 필드가 포함됩니다.
    * "생성" 버튼 클릭 시 `confirmCreateRoom` 함수를 호출합니다.
    * "X" 버튼 클릭 시 `closeCreateRoomModel` 함수를 호출합니다.
* **"생성 완료" 모달:**
    * 생성된 룸의 입장 코드를 표시합니다. (예: `BATTLE-58392`)
    * 입장 코드를 복사할 수 있는 "복사" 버튼이 있습니다.
    * "입장하기" 버튼 클릭 시 `enterRoomBtn` 함수를 호출하여 게임 대기방으로 이동합니다.
    * "X" 버튼 클릭 시 `closeCreatedRoomModel` 함수를 호출합니다.

## CSS 파일

* `MainPage.css`: 컴포넌트의 스타일링을 담당하는 CSS 파일입니다.

## 의존성

* `react`, `react-dom`
* `react-router-dom`