import React, { useState, useEffect, useRef } from 'react';
import ChatWindow from './ChatWindow';
import './FloatingChat.css';

const FloatingChat = () => {
    const [isOpen, setIsOpen] = useState(false);

    // ✨ [변경 1] position의 의미 변경: {x: right, y: bottom}
    // 초기 위치를 오른쪽, 아래쪽에서 각각 20px 떨어진 곳으로 설정합니다.
    const [position, setPosition] = useState({
        x: 20, // right: 20px
        y: 20, // bottom: 20px
    });

    const nodeRef = useRef(null);
    const isDraggingRef = useRef(false);
    const hasDraggedRef = useRef(false);
    const dragStartPosRef = useRef({ x: 0, y: 0 });

    const onMouseDown = (e) => {
        if (e.button !== 0) return;

        isDraggingRef.current = true;
        hasDraggedRef.current = false;
        
        // ✨ [변경 2] 드래그 시작점 계산 변경
        // 마우스 위치를 화면 오른쪽 하단 기준으로 계산합니다.
        dragStartPosRef.current = {
            x: (window.innerWidth - e.clientX) - position.x,
            y: (window.innerHeight - e.clientY) - position.y,
        };
        e.preventDefault();
    };

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!isDraggingRef.current) return;
            hasDraggedRef.current = true;

            // ✨ [변경 3] 새 위치 계산 로직 변경
            // 마우스의 현재 위치를 기준으로 새로운 right, bottom 값을 계산합니다.
            const newX = (window.innerWidth - e.clientX) - dragStartPosRef.current.x;
            const newY = (window.innerHeight - e.clientY) - dragStartPosRef.current.y;
            
            setPosition({ x: newX, y: newY });
        };

        window.addEventListener('mousemove', onMouseMove);
        return () => window.removeEventListener('mousemove', onMouseMove);
    }, []); // position을 의존성 배열에서 제거하여 불필요한 재등록 방지

    useEffect(() => {
        const onMouseUp = () => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            
            // ✨ 변경점: 드래그가 아니고(!hasDraggedRef) 창이 닫혀있을 때(!isOpen)만 실행
            if (!hasDraggedRef.current && !isOpen) {
                setIsOpen(true); // 토글이 아닌 '열기'로 동작을 명확히 함
            }
            
            // 드래그 상태가 끝났으니 hasDraggedRef를 다시 false로 초기화해주는 것이 좋습니다.
            hasDraggedRef.current = false; 
        };
        
        window.addEventListener('mouseup', onMouseUp);
        return () => window.removeEventListener('mouseup', onMouseUp);
    }, [isOpen]); // ✨ 변경점: 의존성 배열에 isOpen 추가

    return (
        <div
            ref={nodeRef}
            className={`floating-chat-container ${isOpen ? 'open' : ''}`}
            // ✨ [변경 4] style 속성을 bottom과 right로 변경
            style={{ 
                bottom: `${position.y}px`, 
                right: `${position.x}px` 
            }}
        >
            {isOpen ? (
                <div className="chat-window-wrapper">
                    <ChatWindow />
                    <footer className="chat-window-header" onMouseDown={onMouseDown}>
                        <button onClick={() => setIsOpen(false)} className="close-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </footer>
                </div>
            ) : (
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