# Login.jsx

이 파일은 COBY 애플리케이션의 로그인 페이지를 구현하는 React 컴포넌트인 `CobyLoginPage`를 정의합니다. 사용자는 이 페이지에서 로봇 캐릭터와의 상호작용 및 Google, Kakao를 통한 소셜 로그인을 할 수 있습니다.

## 주요 기능 및 시각적 요소

* **동적인 배경 효과:**
    * **별 (Stars):** 배경에 무작위로 생성되고 깜빡이는 별들을 표시합니다.
    * **구름 (Clouds):** 페이지에 부유하는 구름 효과를 제공합니다.
    * **버블 (Bubbles):** 화면 하단에서 위로 떠오르는 버블 애니메이션을 구현합니다.
    * **부유하는 프로그래밍 언어 로고:** Java, Python, C++, JavaScript 로고가 화면에 떠다니는 애니메이션을 보여줍니다.
* **인터랙티브 로봇 캐릭터:**
    * **로봇 애니메이션:** 로봇 클릭 시 머리 크기 변화, 몸체 색상 변경, 입 움직임 등의 시각적 피드백을 제공합니다.
    * **별 뿌리기 효과 (StarBurst):** 로봇 클릭 시 클릭 지점에서 다양한 색상의 별들이 흩뿌려지는 애니메이션을 생성합니다.
    * **코드 파티클 (CodeParticles):** 로봇 클릭 시 코드 관련 심볼들이 위로 떠오르는 파티클 애니메이션을 생성합니다.
* **소셜 로그인:** Google 및 Kakao OAuth를 통한 로그인 기능을 제공합니다.

## 컴포넌트 구조 및 상태 관리

`CobyLoginPage` 컴포넌트는 `useRef` 훅을 활용하여 DOM 요소를 참조하고, 다양한 배경 및 인터랙티브 애니메이션을 제어합니다.

### Ref 변수 (`useRef`)

* `starsRef`: 배경 별들이 렌더링될 컨테이너를 참조합니다.
* `bubblesRef`: 버블 효과가 렌더링될 컨테이너를 참조합니다.
* `starBurstRef`: 별 뿌리기 효과가 렌더링될 컨테이너를 참조합니다.
* `codeParticlesRef`: 코드 파티클이 렌더링될 컨테이너를 참조합니다.

### 주요 함수 (`function`)

* `createStars()`: 배경 별들을 생성하고 DOM에 추가합니다.
* `createBubbles()`: 버블 애니메이션 요소들을 생성하고 DOM에 추가합니다.
* `createStarBurst(x, y)`: 지정된 좌표에서 별 뿌리기 애니메이션을 생성합니다.
* `createCodeParticles(x, y)`: 지정된 좌표에서 코드 심볼 파티클 애니메이션을 생성합니다.
* `animateRobot()`: 로봇 캐릭터의 클릭 애니메이션을 실행합니다.
* `handleRobotClick()`: 로봇 클릭 이벤트 발생 시 `animateRobot` 및 `createStarBurst` 함수를 호출합니다.
* `handleGoogleLogin()`: Google OAuth 인증 URL로 사용자를 리디렉션하여 Google 로그인을 시작합니다.
* `handleKakaoLogin()`: Kakao OAuth 인증 URL로 사용자를 리디렉션하여 Kakao 로그인을 시작합니다.

## `useEffect` 훅의 활용

* **초기 애니메이션 설정:** 컴포넌트가 마운트될 때 `createStars()`와 `createBubbles()` 함수를 호출하여 초기 배경 애니메이션을 시작합니다.
* **로그인 성공 처리 (주석 처리됨):** `/oauth/success` 경로로 이동했을 때 서버로부터 사용자 정보를 받아와 로그인 성공 여부를 확인하고, 성공 시 닉네임 입력 페이지로 이동하는 로직이 포함되어 있었으나 현재는 주석 처리되어 있습니다.

## CSS 파일

* `Login.css`: 컴포넌트의 스타일링 및 애니메이션을 담당하는 CSS 파일입니다.

## 의존성

* `react`, `react-dom`
* `react-router-dom`
* `axios` (주석 처리된 로그인 성공 처리 로직에서 사용)