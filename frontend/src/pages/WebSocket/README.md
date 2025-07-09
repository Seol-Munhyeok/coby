## WebSocketContext.jsx

이 파일은 애플리케이션 전역에서 WebSocket 연결을 관리하고, 채팅 메시지 및 연결 상태를 제공하는 React Context (`WebSocketContext`)를 정의합니다. 이를 통해 여러 컴포넌트에서 쉽게 WebSocket 기능에 접근할 수 있도록 합니다.

### 주요 기능

* **WebSocket 연결 관리:** 환경 변수 `REACT_APP_API_URL` 값을 활용해 WebSocket(`ws://<HOST>/ws/chat`에 연결하고, 언마운트 시 연결을 정리합니다.
* **실시간 메시지 수신:** 서버로부터 메시지를 수신하여 파싱하고, `messages` 상태에 추가합니다.
* **메시지 전송:** `sendMessage` 함수를 통해 연결된 WebSocket으로 메시지를 전송합니다.
* **연결 상태 및 오류 추적:** `isConnected` (연결 여부)와 `error` (연결 오류 메시지) 상태를 관리하여 연결 상태를 외부에 노출합니다.
* **Context Provider:** 자식 컴포넌트들이 WebSocket 관련 상태와 함수에 접근할 수 있도록 `WebSocketContext.Provider`를 제공합니다.
* **커스텀 훅 `useWebSocket`:** Context를 쉽게 소비할 수 있도록 `useWebSocket` 커스텀 훅을 내보냅니다.

### Context 값 (`contextValue`)

`WebSocketContext.Provider`를 통해 제공되는 값들은 다음과 같습니다:

* `messages`: 수신된 모든 메시지들을 담고 있는 배열.
* `sendMessage`: 메시지를 WebSocket 서버로 전송하는 함수.
* `isConnected`: WebSocket 연결이 활성화되었는지 나타내는 boolean 값.
* `error`: WebSocket 연결 중 발생한 오류 메시지 (있는 경우).
* `wsInstance`: (주의) 원본 WebSocket 인스턴스. 직접적인 접근은 피하고, 필요한 경우에만 사용해야 합니다.

### State 변수 (`useState`)

* `messages`: 수신된 채팅 메시지 배열.
* `isConnected`: WebSocket 연결 상태 (boolean).
* `error`: WebSocket 연결 또는 메시지 처리 중 발생한 오류 메시지.

### Ref 변수 (`useRef`)

* `ws`: WebSocket 인스턴스를 저장하는 `ref`. 컴포넌트 생명주기 동안 WebSocket 인스턴스를 유지하는 데 사용됩니다.

### 주요 함수 (`function`)

* `sendMessage(messageData)`: 주어진 `messageData`를 JSON 문자열로 변환하여 WebSocket을 통해 서버로 전송합니다. WebSocket이 연결되어 있지 않으면 경고 메시지를 로깅합니다.

### `useEffect` 훅의 활용

* **WebSocket 초기화 및 생명주기 관리:**
    * 컴포넌트 마운트 시 WebSocket 연결을 시도하고, `onopen`, `onmessage`, `onclose`, `onerror` 이벤트 핸들러를 등록합니다.
    * `onmessage`에서는 수신된 데이터를 JSON으로 파싱하여 `messages` 상태에 추가합니다. 파싱 오류 시 원본 데이터를 "System" 메시지로 추가합니다.
    * 컴포넌트 언마운트 시 또는 효과가 다시 실행될 때 기존 WebSocket 연결을 정리(close)합니다.
    * 빈 의존성 배열(`[]`)로 인해 컴포넌트가 처음 마운트될 때 한 번만 실행되고, 언마운트될 때 정리됩니다.

### 의존성

* `react`

---

## WebSocketLayout.jsx

이 파일은 `WebSocketProvider`를 사용하여 애플리케이션의 특정 라우트 섹션에 WebSocket 기능을 주입하는 레이아웃 컴포넌트입니다.

### 주요 기능

* **WebSocket Context 제공:** `WebSocketProvider`로 하위 컴포넌트들을 감싸서, 해당 레이아웃 내의 모든 자식 컴포넌트들이 `WebSocketContext`에 접근할 수 있도록 합니다.
* **라우트 Outlet:** `react-router-dom`의 `Outlet` 컴포넌트를 사용하여 중첩된 라우트의 자식 컴포넌트들이 렌더링될 위치를 지정합니다. 이는 `WebSocketLayout`이 라우트 정의에서 부모 컴포넌트로 사용될 때 유용합니다.

### 컴포넌트 Props

* 이 컴포넌트는 특별한 `props`를 직접 받지 않습니다. `Outlet`을 통해 하위 라우트 컴포넌트가 렌더링됩니다.

### 사용 시나리오

애플리케이션 라우팅 설정 시, WebSocket 통신이 필요한 경로들을 이 `WebSocketLayout` 컴포넌트 아래에 중첩하여 정의함으로써, 해당 경로의 모든 자식 컴포넌트들이 별도의 임포트나 상태 관리 없이 `useWebSocket` 훅을 통해 WebSocket 기능에 접근할 수 있습니다.

**예시 (React Router 설정):**

```jsx
import { Routes, Route } from 'react-router-dom';
import WebSocketLayout from './components/WebSocketLayout';
import WaitingRoom from './pages/WaitingRoom';
import BattleRoom from './pages/BattleRoom';
import ResultRoom from './pages/ResultRoom';

function App() {
  return (
    <Routes>
      {/* WebSocket이 필요한 경로들은 WebSocketLayout 내부에 정의 */}
      <Route path="/" element={<WebSocketLayout />}>
        <Route path="waitingRoom" element={<WaitingRoom />} />
        <Route path="battle" element={<BattleRoom />} />
        <Route path="result" element={<ResultRoom />} />
        {/* 다른 WebSocket 의존 컴포넌트들 */}
      </Route>
      {/* WebSocket이 필요 없는 다른 경로들 */}
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}