# MyCard.jsx:
사용자 프로필 카드(앞면, 뒷면)와 관련된 JSX 및 로직(닉네임 로딩, 별 생성 효과)을 포함합니다.

useUserStore에서 nickname과 setNickname을 가져와 사용합니다.

MainPage.css의 스타일이 필요하므로 MainPage.css를 임포트 합니다. (모듈화된 CSS 파일로 변경 고려 가능)

# TierInfo.jsx:

티어 정보 섹션의 JSX를 포함합니다.

# RankCard.jsx:

rank, name, rating, wins, losses, tier, languageLogo를 props로 받아 랭킹 카드 하나를 렌더링하는 함수형 컴포넌트입니다.

1위 카드는 다른 카드와 스타일이 약간 다르므로 isFirstPlace prop을 통해 조건부 렌더링을 적용했습니다.

언어 로고 SVG는 languageLogo prop에 따라 동적으로 렌더링되도록 LanguageLogoSvg 내부 컴포넌트를 정의했습니다.

# RoomList.jsx:

참여 가능한 방 목록을 렌더링하는 컴포넌트입니다.

rooms, enterRoomBtn, fetchRooms를 props로 받습니다. fetchRooms를 받아서 방 목록 새로고침 버튼에 연결했습니다.

# MainPage.jsx:

기존 MainPage의 주요 로직과 상태를 유지합니다.

MyCard, TierInfo, RankCard, RoomList 컴포넌트를 임포트하여 적절한 위치에 배치하고 필요한 props를 전달합니다.

API 호출(fetchRooms) 및 모달 관련 상태 관리는 MainPage에서 계속 담당합니다.