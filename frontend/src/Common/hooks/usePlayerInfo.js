import { useState } from 'react';
import axios from 'axios';

// 이 훅은 필요한 데이터와 설정 함수를 외부에서 받습니다.
function usePlayerInfo({ users, setNotification }) {
    const [playerInfoForModal, setPlayerInfoForModal] = useState(null);
    const [showPlayerInfoModal, setShowPlayerInfoModal] = useState(false);

    // 플레이어 정보 로딩 및 모달 표시를 처리하는 함수
    const handleShowPlayerInfo = async (player, setShowContextMenu) => {
        if (!player) return;

        setShowContextMenu(false);

        const fullPlayer = users.find(user => user.nickname === player.name);
        if (!fullPlayer || !fullPlayer.userId) {
            console.error("Could not find userId for selected player");
            setNotification({message: "플레이어 정보를 찾을 수 없습니다.", type: "error"});
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        const targetUserId = fullPlayer.userId;

        try {
            // Promise.all을 사용해 두 개의 API를 동시에 호출
            const [userResponse, historyResponse] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL}/api/users/${targetUserId}`, { withCredentials: true }),
                axios.get(`${process.env.REACT_APP_API_URL}/api/rooms/${targetUserId}/history`, { withCredentials: true })
            ]);

            const completePlayerData = {
                ...userResponse.data,
                recentGames: historyResponse.data
            };

            setPlayerInfoForModal(completePlayerData);
            setShowPlayerInfoModal(true);

        } catch (error) {
            console.error("Error fetching player info or history:", error);
            setNotification({message: "플레이어 정보 로딩에 실패했습니다.", type: "error"});
            setTimeout(() => setNotification(null), 3000);
        }
    };

    return {
        playerInfoForModal,
        showPlayerInfoModal,
        setShowPlayerInfoModal,
        handleShowPlayerInfo,
    };
}

export default usePlayerInfo;