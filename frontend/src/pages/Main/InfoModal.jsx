import React, { useState, useEffect } from 'react';
import './MainPage.css';
import { BronzeTierBadge, SilverTierBadge, GoldTierBadge, PlatinumTierBadge, DiamondTierBadge, MasterTierBadge } from './TierInfo';

/**
 * COBY 서비스 및 티어 정보를 보여주는 모달 컴포넌트
 * @param {object} props
 * @param {boolean} props.isOpen - 모달의 열림/닫힘 상태
 * @param {function} props.onClose - 모달을 닫는 함수
 * @param {string} props.initialTab - 모달이 열릴 때 처음으로 보여줄 탭 ('coby' 또는 'tier')
 */
function InfoModal({ isOpen, onClose, initialTab }) {
    // 모달 내부의 활성화된 탭을 관리하는 상태 ('coby' 또는 'tier')
    const [activeTab, setActiveTab] = useState(initialTab);

    // initialTab prop이 변경될 때마다 activeTab 상태를 업데이트
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    // 모달이 열려있지 않으면 아무것도 렌더링하지 않음
    if (!isOpen) {
        return null;
    }

    // 모달의 배경(오버레이) 클릭 시 닫히도록 하는 핸들러
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // 'COBY 설명' 탭의 콘텐츠
    const CobyInfoContent = () => (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">COBY란?</h2>
            <p className="text-gray-600">
                COBY는 "Coding Online Battle with You"의 약자로, 친구 또는 다른 사용자들과 함께 코딩 실력을 겨룰 수 있는 온라인 배틀 플랫폼입니다.
                <br/><br/>
                다양한 난이도의 알고리즘 문제들을 풀면서 당신의 코딩 실력을 향상시키고, 티어를 높여보세요!
            </p>
        </div>
    );

    // '티어' 탭의 콘텐츠
    const TierInfoContent = () => (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">티어 안내</h2>
            <ul className="space-y-4">
                <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <BronzeTierBadge />
                    <span className="font-semibold text-gray-700">0 ~ 1000 점</span>
                </li>
                <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <SilverTierBadge />
                    <span className="font-semibold text-gray-700">1001 ~ 1500 점</span>
                </li>
                <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <GoldTierBadge />
                    <span className="font-semibold text-gray-700">1501 ~ 2000 점</span>
                </li>
                <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <PlatinumTierBadge />
                    <span className="font-semibold text-gray-700">2001 ~ 2500 점</span>
                </li>
                <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <DiamondTierBadge />
                    <span className="font-semibold text-gray-700">2501 ~ 3000 점</span>
                </li>
                <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <MasterTierBadge />
                    <span className="font-semibold text-gray-700">3001 점 이상</span>
                </li>
            </ul>
        </div>
    );

    return (
        <div className="info-modal-overlay" onClick={handleOverlayClick}>
            <div className="info-modal-content">
                {/* 닫기 버튼 */}
                <button onClick={onClose} className="info-modal-close-button">
                    <i className="fas fa-times"></i>
                </button>
                
                {/* 왼쪽 메뉴 */}
                <div className="info-modal-menu">
                    <button 
                        onClick={() => setActiveTab('coby')}
                        className={`info-modal-menu-button ${activeTab === 'coby' ? 'active' : ''}`}
                    >
                        <i className="fas fa-info-circle mr-2"></i> COBY 설명
                    </button>
                    <button 
                        onClick={() => setActiveTab('tier')}
                        className={`info-modal-menu-button ${activeTab === 'tier' ? 'active' : ''}`}
                    >
                        <i className="fas fa-star mr-2"></i> 티어
                    </button>
                </div>

                {/* 오른쪽 콘텐츠 */}
                <div className="info-modal-body">
                    {activeTab === 'coby' && <CobyInfoContent />}
                    {activeTab === 'tier' && <TierInfoContent />}
                </div>
            </div>
        </div>
    );
}

export default InfoModal;
