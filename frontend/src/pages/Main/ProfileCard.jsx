import React from 'react';
import { useAuth } from '../AuthContext/AuthContext';
import { PythonLogo, JavaLogo, CppLogo } from '../../Common/components/LanguageCards';
import { DEFAULT_TIER_NAME, TierBadge } from './TierInfo';
import './MainPage.css';

/**
 * 사용자 정보를 보여주는 새로운 프로필 카드 컴포넌트
 * @param {object} props
 * @param {function} props.onOpenInfoModal - 정보 모달을 여는 함수
 * @param {function} props.onProfileClick - 프로필 카드 클릭 시 호출되는 함수
 */
function ProfileCard({ onOpenInfoModal, onProfileClick }) {
    const { user } = useAuth(); // AuthContext에서 user 정보 가져오기

    // 사용자 정보가 없을 경우 기본값 설정
    const nickname = user?.nickname || '게스트';
    const preferredLanguage = user?.preferredLanguage || 'python';
    const tierName = user?.tierName || DEFAULT_TIER_NAME;

    /**
     * 티어 이름에 따라 해당하는 CSS 클래스를 반환합니다.
     * @param {string} tier - 사용자의 티어 이름 (예: '골드')
     * @returns {string} - 티어에 맞는 스타일 클래스 (예: 'profile-card-gold')
     */
    const getTierCardClass = (tier) => {
        // 한글 티어 이름을 영어 소문자로 매핑
        const tierMap = {
            '브론즈': 'bronze',
            '실버': 'silver',
            '골드': 'gold',
            '플래티넘': 'platinum',
            '다이아몬드': 'diamond',
            '마스터': 'master',
        };
        const tierInEnglish = tierMap[tier] || 'bronze'; // 매핑되지 않은 경우 기본값으로 'bronze' 사용
        return `profile-card-${tierInEnglish}`;
    };

    /**
     * 사용자의 선호 언어에 맞는 로고 컴포넌트를 렌더링합니다.
     */
    const renderLogo = () => {
        switch (preferredLanguage) {
            case 'python':
                return <PythonLogo />;
            case 'java':
                return <JavaLogo />;
            case 'cpp':
                return <CppLogo />;
            default:
                return <PythonLogo />; // 기본값
        }
    };
    
    // 정보 버튼 클릭 시 'coby' 탭으로 모달을 열도록 호출
    const handleInfoButtonClick = () => {
        onOpenInfoModal('coby');
    };
    
    // 티어 뱃지 클릭 시 'tier' 탭으로 모달을 열도록 호출 (이벤트 버블링 중단)
    const handleTierBadgeClick = (e) => {
        e.stopPropagation(); // 부모 요소(<div className="profile-card">)의 onClick 이벤트가 실행되는 것을 방지
        onOpenInfoModal('tier');
    };

    return (
        <div className="flex flex-col h-full">
            {/* 티어별로 디자인이 변경되는 프로필 카드, 클릭 시 '내 정보' 탭으로 이동 */}
            <div 
                className={`profile-card ${getTierCardClass(tierName)} cursor-pointer`}
                onClick={onProfileClick}
            >
                <div className="p-6 flex flex-col items-center text-center h-full">
                    {/* 선호 언어 로고 */}
                    <div className="w-24 h-24 mb-4 flex items-center justify-center language-logo-container">
                        {renderLogo()}
                    </div>
                    {/* 닉네임 */}
                    <h3 className="text-3xl font-bold tracking-wider">{nickname}</h3>
                    {/* 선호 언어 텍스트 */}
                    <p className="text-sm opacity-80 mb-6 capitalize">{preferredLanguage}</p>

                    {/* 티어 뱃지 (카드 하단에 위치) */}
                    <div className="mt-auto cursor-pointer" onClick={handleTierBadgeClick}>
                         <TierBadge tierName={tierName} />
                    </div>
                </div>
            </div>
            {/* '[COBY가 처음인가요?]' 버튼 */}
            <button
                onClick={handleInfoButtonClick}
                className="info-button"
            >
                <i className="fas fa-info-circle mr-2"></i>
                COBY가 처음인가요?
            </button>
        </div>
    );
}

export default ProfileCard;