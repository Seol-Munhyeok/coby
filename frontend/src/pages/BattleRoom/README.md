# BattleRoom.jsx

이 파일은 실시간 협업 코딩 환경을 제공하는 React 컴포넌트인 `CodingBattle`을 정의합니다. 사용자는 이 컴포넌트에서 코드를 작성하고, 제출하며, 다른 참가자들과 실시간으로 진행 상황을 공유할 수 있습니다.

## 주요 기능

* **실시간 코드 에디터 (Monaco Editor):** 사용자가 코드를 작성할 수 있는 에디터를 제공합니다.
* **언어 선택:** Python, Java, C++ 등 다양한 프로그래밍 언어를 선택할 수 있습니다.
* **코드 실행 및 제출:** 작성된 코드를 서버에 제출하고 실행 결과를 받습니다.
* **실시간 진행 상황:** 다른 참가자들의 코드 작성 현황(줄 수, 진행률)을 실시간으로 확인할 수 있습니다.
* **타이머:** 전체 배틀 시간을 표시하고 관리합니다.
* **다크/라이트 모드 토글:** UI 테마를 변경할 수 있습니다.
* **부정행위 감지 (주석 처리됨):** 화면 이탈 등 특정 행동 감지 시 경고 및 제출 제한 기능이 포함되어 있었으나 현재는 주석 처리되어 있습니다.
* **로딩 모달:** 코드 실행/제출 시 로딩 상태를 표시합니다.
* **경고/정보 모달:** 사용자에게 특정 메시지를 팝업으로 표시합니다.
* **Resiable Panes:** 문제 영역, 코드 에디터, 실행 결과 영역의 크기를 조절할 수 있습니다.
* **STOMP WebSocket 통신:** 서버와의 실시간 데이터 교환을 위해 WebSocket을 사용합니다.

## 컴포넌트 구조 및 상태 관리

`CodingBattle` 컴포넌트는 `useState`와 `useRef` 훅을 활용하여 다양한 상태와 DOM 요소를 관리합니다.

### State 변수 (`useState`)

* `myUserId`: 현재 사용자의 고유 ID. WebSocket 메시지 전송 시 발신자 식별에 사용됩니다.
* `currentCodeValue`: Monaco Editor의 현재 코드 값. 에디터 UI 렌더링 및 WebSocket 전송에 사용됩니다.
* `currentLanguage`: 현재 선택된 프로그래밍 언어. Monaco Editor 언어 설정에 사용됩니다.
* `isLoading`: 코드 실행/제출 로딩 상태. 로딩 모달 표시 여부를 제어합니다.
* `elapsedTime`: 코드 실행 경과 시간. 로딩 모달에 표시됩니다.
* `isFeverTime`: 특정 조건 (예: 코드 라인 수) 충족 시 발동되는 '피버 타임' 상태. UI 효과를 제어합니다.
* `remainingTime`: 메인 배틀 타이머의 남은 시간. UI 렌더링 및 시간 종료 조건에 사용됩니다.
* `progressBarWidth`: 진행률 바의 너비. UI 렌더링에 사용됩니다.
* `drawerState`: 드로어(사이드바)의 열림 상태 (0: 닫힘, 1: 부분 열림, 2: 완전 열림). UI 렌더링에 사용됩니다.
* `executionResult`: 코드 실행 결과 텍스트. UI에 실행 결과를 표시합니다.
* `cheatingDetected`: 부정행위 감지 여부. 코드 제출 버튼 비활성화에 사용됩니다.
* `warningCount`: 부정행위 경고 횟수. 경고 메시지 표시 및 `cheatingDetected` 설정에 사용됩니다.
* `isModalOpen`: 경고/정보 모달 열림 상태. 모달 표시 여부를 제어합니다.
* `modalTitle`: 모달 제목. 모달 UI 렌더링에 사용됩니다.
* `modalMessage`: 모달 메시지. 모달 UI 렌더링에 사용됩니다.
* `modalType`: 모달 타입 ('info', 'warning', 'error'). 모달 UI 스타일 변경에 사용됩니다.
* `isFullscreenPromptOpen`: 전체 화면 요청 모달 열림 상태 (현재 주석 처리됨).
* `opponents`: 현재 방에 참여 중인 상대방들의 정보 배열. UI에 상대방 진행 상황을 표시하며, WebSocket 메시지 수신 시 업데이트됩니다.
* `isDarkMode`: 다크 모드 활성화 여부. UI 테마 변경에 사용됩니다.

### Ref 변수 (`useRef`)

* `editorRef`: Monaco Editor 인스턴스를 참조. 코드 에디터 내용 접근 및 조작에 사용됩니다.
* `timerIdRef`: `setTimeout`/`setInterval` ID를 저장. 코드 업데이트 디바운싱, 실행 시간 측정 타이머 제어에 사용됩니다.
* `domTimerRef`: 남은 시간을 표시하는 DOM 요소를 참조. UI에 남은 시간 업데이트에 사용됩니다.
* `intervalRef`: 메인 배틀 타이머의 `setInterval` ID를 저장. 메인 타이머 제어에 사용됩니다.
* `nicknameRef`: 사용자 닉네임 입력 필드를 참조. 사용자 입력에 사용됩니다.
* `answerRef`: 문제의 정답 코드 또는 기본 코드를 참조. 초기 코드 설정에 사용됩니다.
* `languageRef`: 언어 선택 드롭다운을 참조. 선택된 프로그래밍 언어를 제어합니다.
* `connectTimeRef`: 코드 실행 시간 측정 타이머의 `setInterval` ID. 로딩 모달의 경과 시간 업데이트에 사용됩니다.
* `startTimeRef`: 코드 실행 시작 시간. 경과 시간 계산에 사용됩니다.
* `stompClientRef`: STOMP 클라이언트 인스턴스를 참조. WebSocket 연결 및 메시지 전송에 사용됩니다.

### 주요 함수 (`function` / `useCallback`)

* `showModal(title, message, type)`: 특정 제목, 메시지, 타입으로 모달을 표시합니다.
* `closeModal()`: 현재 열려있는 모달을 닫고 상태를 초기화합니다.
* `handleSubmit()`: 코드 제출 버튼 클릭 시 실행되는 함수. 코드를 서버로 전송하고 결과를 처리합니다.
* `handleGiveUp()`: 포기 버튼 클릭 시 실행되는 함수. 사용자에게 메시지를 보여주고 결과 페이지로 이동합니다.
* `handleLanguageChange()`: 언어 선택 드롭다운 변경 시 Monaco Editor의 언어를 변경합니다.
* `handleDrawerToggle()`: 드로어(사이드바)의 열림 상태를 토글합니다 (0 -> 1 -> 2 -> 0).
* `toggleDarkMode()`: 다크 모드 상태를 토글합니다.
* `formatTime(totalSeconds)`: 총 초 단위 시간을 "HH:MM:SS" 또는 "MM:SS" 형식으로 변환합니다.
* `handleEditorChange(value)`: Monaco Editor의 내용이 변경될 때마다 호출됩니다. 디바운스를 적용하여 코드 업데이트 메시지를 서버로 전송합니다.
* `handleEditorDidMount(editor, monacoInstance)`: Monaco Editor가 DOM에 마운트된 후 호출됩니다. 붙여넣기 방지 이벤트 리스너를 추가합니다.

## `useEffect` 훅의 활용

* **메인 배틀 타이머 관리:** 컴포넌트 마운트 시 메인 배틀 타이머를 설정하고, `remainingTime` 상태를 1초마다 업데이트합니다. 시간이 0이 되면 모달을 표시하고 타이머를 중지합니다.
* **초기 코드 및 Ref 설정:** 컴포넌트 마운트 시 Monaco Editor의 초기 코드와 `nicknameRef`, `answerRef`, `languageRef`의 초기값을 설정합니다.
* **진행률 바 및 타이머 UI 업데이트:** `remainingTime`이 변경될 때마다 진행률 바의 너비를 계산하고, 타이머 DOM 요소의 텍스트를 업데이트합니다.
* **WebSocket 연결 초기화 및 구독:** 컴포넌트 마운트 시 WebSocket 연결을 초기화하고, STOMP 클라이언트를 통해 `/app/join_room` 및 `/topic/room/local_battle_room_alpha` 토픽을 구독하여 실시간 코드 업데이트 및 제출 결과를 수신합니다. 컴포넌트 언마운트 시 WebSocket 연결을 해제합니다.
* **부정행위 감지 (주석 처리됨):** `window`의 `blur` 이벤트를 감지하여 화면 이탈 시 경고 횟수를 증가시키고, 일정 횟수 이상 이탈 시 부정행위로 간주하여 코드 제출을 제한하는 기능이 있었으나 현재는 주석 처리되어 있습니다.
* **전체 화면 요청 (주석 처리됨):** 브라우저의 전체 화면 상태 변화를 모니터링하여 사용자에게 전체 화면 모드를 요청하는 모달을 표시하는 기능이 있었으나 현재는 주석 처리되어 있습니다.

## CSS 파일

* `BattleRoom.css`: 컴포넌트의 스타일링을 담당하는 CSS 파일입니다.

## 의존성

* `react`, `react-dom`
* `@monaco-editor/react`, `monaco-editor`
* `react-router-dom`
* `react-resizable-panels`
* `sockjs-client`, `@stomp/stompjs`
* `./WarningModal`, `./FullscreenPromptModal` (로컬 컴포넌트)