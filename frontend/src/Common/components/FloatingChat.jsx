import React, { useState, useEffect, useRef } from 'react';
import ChatWindow from './ChatWindow'; // 기존 ChatWindow 컴포넌트
import './FloatingChat.css'; // CSS는 변경 없음

const FloatingChat = () => {
    // 채팅창의 확장/축소 상태 관리
    const [isOpen, setIsOpen] = useState(false);

    // 플로팅 요소의 위치 관리
    const [position, setPosition] = useState({
        x: window.innerWidth - 80,
        y: window.innerHeight - 80,
    });

    // 드래그 상태 및 로직 처리를 위한 Ref
    const nodeRef = useRef(null); // 플로팅 요소의 DOM 노드 참조
    const isDraggingRef = useRef(false); // 현재 드래그 중인지 여부
    const hasDraggedRef = useRef(false); // 드래그 동작이 발생했는지 여부 (클릭과 구분용)
    const dragStartPosRef = useRef({ x: 0, y: 0 }); // 드래그 시작 시 마우스 위치

    // ✨ 마우스 다운 이벤트 핸들러 (드래그 시작점)
    // 이 함수는 축소된 버튼과 확장된 창의 헤더 모두에서 사용됩니다.
    const onMouseDown = (e) => {
        // e.button === 0 은 마우스 왼쪽 버튼 클릭을 의미합니다.
        if (e.button !== 0) return;

        isDraggingRef.current = true;
        hasDraggedRef.current = false; // 드래그 시작 시 '이동 없었음'으로 초기화
        dragStartPosRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
        // 드래그 중 텍스트 선택 같은 기본 동작 방지
        e.preventDefault();
    };

    // ↔️ 전역 mousemove 이벤트 핸들러 (드래그 중 위치 이동)
    useEffect(() => {
        const onMouseMove = (e) => {
            if (!isDraggingRef.current) return;

            // 드래그가 시작되면 '이동 있었음'으로 표시
            hasDraggedRef.current = true;

            const newX = e.clientX - dragStartPosRef.current.x;
            const newY = e.clientY - dragStartPosRef.current.y;
            
            setPosition({ x: newX, y: newY });
        };

        window.addEventListener('mousemove', onMouseMove);
        return () => window.removeEventListener('mousemove', onMouseMove);
    }, []); // 의존성 배열이 비어있으므로 컴포넌트 마운트 시 한 번만 실행

    // 🖱️ 전역 mouseup 이벤트 핸들러 (드래그 종료 및 클릭 판별)
    useEffect(() => {
        const onMouseUp = () => {
            if (!isDraggingRef.current) return;

            isDraggingRef.current = false;

            // 드래그 동작이 없었을 경우 '클릭'으로 간주하고 창 상태를 토글합니다.
            if (!hasDraggedRef.current) {
                setIsOpen(prev => !prev);
            }
        };
        
        window.addEventListener('mouseup', onMouseUp);
        return () => window.removeEventListener('mouseup', onMouseUp);
    }, []); // 의존성 배열이 비어있으므로 컴포넌트 마운트 시 한 번만 실행

    return (
        <div
            ref={nodeRef}
            className={`floating-chat-container ${isOpen ? 'open' : ''}`}
            style={{ top: `${position.y}px`, left: `${position.x}px` }}
        >
            {isOpen ? (
                // 채팅창이 열린 상태
                <div className="chat-window-wrapper">
                    {/* 헤더에 onMouseDown을 추가하여 드래그 가능하게 만듭니다. */}
                    <header className="chat-window-header" onMouseDown={onMouseDown}>
                        {/* 닫기 버튼은 드래그가 아닌 단순 클릭으로 동작해야 하므로 onMouseDown을 적용하지 않습니다. */}
                        <button onClick={() => setIsOpen(false)} className="close-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </header>
                    <ChatWindow />
                </div>
            ) : (
                // 축소된 플로팅 버튼 상태
                // 버튼에서는 onClick을 제거하고 onMouseDown으로 모든 동작을 처리합니다.
                <button
                    className="floating-toggle-button"
                    onMouseDown={onMouseDown}
                    title="채팅 열기"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </button>
            )}
        </div>
    );
};

export default FloatingChat;