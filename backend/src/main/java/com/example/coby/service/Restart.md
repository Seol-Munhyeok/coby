# Coby 재대결(Regame) 로직 흐름

이 문서는 Coby 프로젝트의 재대결 기능에 대한 기술적인 흐름을 설명합니다. 사용자의 요청부터 새로운 게임이 시작되기까지 프론트엔드와 백엔드 간의 REST API 및 WebSocket 통신 순서를 상세히 기술합니다.

## 등장 요소

-   **Frontend**: React 애플리케이션
    -   `ResultRoom.jsx`: 결과 페이지 UI, 재대결 요청 시작
    -   `WebSocketContext.jsx`: 모든 WebSocket 통신 관리
-   **Backend**: Spring Boot 애플리케이션
    -   `WebSocketController.java`: 클라이언트의 WebSocket 메시지 수신 및 처리
    -   `RestartService.java`: 실제 재시작 비즈니스 로직 수행

---

## 재대결 전체 흐름 (Sequence of Events)

### 1. [Frontend] 재대결 요청

-   **위치**: `ResultRoom.jsx`
-   **동작**: 사용자가 '재대결' 버튼을 클릭하면 `regameBtn` 함수가 실행됩니다.
-   **흐름**:
    1.  **(REST API)** 먼저 백엔드에 재시작이 가능한지 확인하기 위해 `POST` 요청을 보냅니다.
        -   **Endpoint**: `/api/rooms/restart/{roomId}`
    2.  **(WebSocket)** 그 직후, `requestRestart` 함수를 호출하여 모든 유저에게 재대결 의사를 묻는 투표를 시작하도록 웹소켓 메시지를 전송합니다.
        -   **Destination**: `/app/room/{roomId}/restart`
        -   **Payload**: `{ "type": "RestartGame", "userId": "..." }`

### 2. [Backend] 재대결 접수 및 투표 개시

-   **위치**: `WebSocketController.java` -> `RestartService.java`
-   **동작**: `/app/room/{roomId}/restart` 메시지를 수신하여 `handleRestart` 메소드가 실행됩니다.
-   **흐름**:
    1.  `RestartService`는 투표 관리를 위한 `RestartSession`을 생성합니다.
    2.  **12초**의 타임아웃을 설정하고, 시간이 만료되면 투표가 자동으로 종료되도록 예약합니다.
    3.  방에 있는 모든 클라이언트에게 투표 모달을 띄우라는 메시지를 전송합니다.
        -   **Destination**: `/topic/restart/{roomId}`
        -   **Payload**: `{ "type": "RestartStarted" }`

### 3. [Frontend] 투표 모달 표시

-   **위치**: `WebSocketContext.jsx` -> `ResultRoom.jsx`
-   **동작**: `/topic/restart/{roomId}` 구독을 통해 `RestartStarted` 메시지를 수신합니다.
-   **흐름**:
    1.  `WebSocketContext`는 `restartModal` 상태를 `true`로 변경합니다.
    2.  `ResultRoom`은 해당 상태 변화를 감지하여, 10초 카운트다운 타이머가 포함된 투표 모달을 화면에 렌더링합니다.

### 4. [Frontend] 사용자 투표

-   **위치**: `ResultRoom.jsx`
-   **동작**: 사용자가 모달에서 '수락' 또는 '거절' 버튼을 클릭합니다.
-   **흐름**:
    1.  `sendVote(roomId, userId, isJoin)` 함수가 호출됩니다. (`isJoin`은 `true` 또는 `false`)
    2.  서버에 투표 결과를 웹소켓 메시지로 전송합니다.
        -   **Destination**: `/app/room/{roomId}/vote`
        -   **Payload**: `{ "type": "Vote", "userId": "...", "isJoin": true/false }`

### 5. [Backend] 투표 처리 및 전파

-   **위치**: `WebSocketController.java` -> `RestartService.java`
-   **동작**: `/app/room/{roomId}/vote` 메시지를 수신하여 `handleVote` 메소드가 실행됩니다.
-   **흐름**:
    1.  `RestartService`는 `RestartSession`에 해당 유저의 투표(`true`/`false`)를 기록합니다.
    2.  누가 어떤 투표를 했는지 모든 클라이언트가 알 수 있도록, 투표 결과를 다시 브로드캐스팅합니다.
        -   **Destination**: `/topic/restart/{roomId}`
        -   **Payload**: `{ "type": "Vote", "userId": "...", "join": true/false }`
    3.  모든 유저가 투표했는지 확인하고, 만약 모두 투표했다면 즉시 **7번 단계**로 이동하여 투표를 종료합니다.

### 6. [Frontend] 실시간 투표 현황 업데이트

-   **위치**: `WebSocketContext.jsx` -> `ResultRoom.jsx`
-   **동작**: `/topic/restart/{roomId}` 구독을 통해 `Vote` 메시지를 수신합니다.
-   **흐름**:
    1.  `WebSocketContext`는 `votes` 상태를 업데이트하여 투표 현황을 저장합니다.
    2.  `ResultRoom`은 이 상태를 바탕으로 "ㅇㅇㅇ님: ✓ 수락" 과 같이 실시간 투표 현황을 화면에 갱신합니다.

### 7. [Backend] 투표 종료 및 결과 집계

-   **위치**: `RestartService.java`
-   **동작**: 다음 두 가지 경우 중 하나가 발생하면 `completeRestart` 메소드가 실행되어 투표를 종료합니다.
    1.  모든 참가자가 투표를 완료했을 때
    2.  서버에 설정된 **12초** 타임아웃이 만료되었을 때 (이때 투표하지 않은 유저는 '거절'로 간주)
-   **흐름**:
    -   **(전원 수락 시)**:
        1.  `createNewRoomFromOld` 메소드를 호출하여 새로운 방을 생성하고, 새 방의 ID(`newRoomId`)를 받아옵니다.
        2.  클라이언트에게 재시작 성공 및 새 방 ID 정보를 메시지로 전송합니다.
            -   **Destination**: `/topic/restart/{roomId}`
            -   **Payload**: `{ "type": "RestartResult", "success": true, "newRoomId": ... }`
    -   **(거절 또는 타임아웃 시)**:
        1.  클라이언트에게 재시작이 실패했음을 알리는 메시지를 전송합니다.
            -   **Destination**: `/topic/restart/{roomId}`
            -   **Payload**: `{ "type": "RestartResult", "success": false, "newRoomId": null }`

### 8. [Frontend] 결과 처리 및 페이지 이동

-   **위치**: `WebSocketContext.jsx` -> `ResultRoom.jsx`
-   **동작**: `/topic/restart/{roomId}` 구독을 통해 `RestartResult` 메시지를 수신합니다.
-   **흐름**:
    1.  우선, `leaveRoom(oldRoomId, ...)` 함수를 호출하여 **기존 방**에서 나간다는 `leave` 메시지를 서버에 전송합니다.
    2.  수신한 `RestartResult` 메시지를 분석합니다.
        -   **(성공 시)**: `newRoomId`가 있으면, `navigateToWaitingRoom` 이벤트를 발생시켜 모든 유저가 새 대기실(`/waitingRoom/{newRoomId}`)로 이동하게 합니다.
        -   **(실패 시)**: `newRoomId`가 `null`이면, `navigateToMain` 이벤트를 발생시켜 모든 유저가 메인 페이지(`/mainpage`)로 이동하게 합니다.
