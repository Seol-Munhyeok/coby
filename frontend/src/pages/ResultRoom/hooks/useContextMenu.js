/**
 * 플레이어 카드 우클릭 메뉴와 관련된 상태 및 로직을 관리하는 커스텀 훅입니다.
 */
import { useState, useEffect, useRef } from 'react';

function useContextMenu() {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const contextMenuRef = useRef(null);

  const handlePlayerCardClick = (event, player) => {
    event.preventDefault();
    setSelectedPlayer(player);
    setContextMenuPos({ x: event.clientX, y: event.clientY });
    setShowContextMenu(true);
  };

  const handleClickOutside = (event) => {
    if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
      setShowContextMenu(false);
      setSelectedPlayer(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return {
    showContextMenu,
    contextMenuPos,
    selectedPlayer,
    contextMenuRef,
    handlePlayerCardClick,
    setShowContextMenu,
    setSelectedPlayer,
  };
}

export default useContextMenu;