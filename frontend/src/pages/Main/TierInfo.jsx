import React from 'react';

// 각 티어의 디자인만 담당하는 함수들
export const BronzeTierBadge = () => (
    <div className="main-tier-badge main-tier-bronze mr-2">
        <svg className="main-tier-icon" viewBox="0 0 24 24" fill="none"
             xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"/>
        </svg>
        브론즈
    </div>
);

export const SilverTierBadge = () => (
    <div className="main-tier-badge main-tier-silver mr-2">
        <svg className="main-tier-icon" viewBox="0 0 24 24" fill="none"
             xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"/>
        </svg>
        실버
    </div>
);

export const GoldTierBadge = () => (
    <div className="main-tier-badge main-tier-gold mr-2">
        <svg className="main-tier-icon" viewBox="0 0 24 24" fill="none"
             xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"/>
        </svg>
        골드
    </div>
);

export const PlatinumTierBadge = () => (
    <div className="main-tier-badge main-tier-platinum mr-2">
        <svg className="main-tier-icon" viewBox="0 0 24 24" fill="none"
             xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"/>
        </svg>
        플래티넘
    </div>
);

export const DiamondTierBadge = () => (
    <div className="main-tier-badge main-tier-diamond mr-2">
        <svg className="main-tier-icon" viewBox="0 0 24 24" fill="none"
             xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"/>
        </svg>
        다이아몬드
    </div>
);

export const MasterTierBadge = () => (
    <div className="main-tier-badge main-tier-master mr-2">
        <svg className="main-tier-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
        </svg>
        마스터
    </div>
);


function TierInfo() {
    return (
        <div className="p-6 bg-gray-50 border-t">
            <h3 className="text-lg font-bold text-gray-800 mb-3">티어 정보</h3>
            <div className="space-y-2">
                <div className="flex items-center">
                    <BronzeTierBadge />
                    <span className="text-sm text-gray-600">0 ~ 1000 레이팅</span>
                </div>
                <div className="flex items-center">
                    <SilverTierBadge />
                    <span className="text-sm text-gray-600">1001 ~ 1500 레이팅</span>
                </div>
                <div className="flex items-center">
                    <GoldTierBadge />
                    <span className="text-sm text-gray-600">1501 ~ 2000 레이팅</span>
                </div>
                <div className="flex items-center">
                    <PlatinumTierBadge />
                    <span className="text-sm text-gray-600">2001 ~ 2500 레이팅</span>
                </div>
                <div className="flex items-center">
                    <DiamondTierBadge />
                    <span className="text-sm text-gray-600">2501 ~ 3000 레이팅</span>
                </div>
                <div className="flex items-center">
                    <MasterTierBadge />
                    <span className="text-sm text-gray-600">3001+ 레이팅</span>
                </div>
            </div>
        </div>
    );
}

export default TierInfo;