import React from 'react';
import {
    BronzeTierBadge,
    SilverTierBadge,
    GoldTierBadge,
    PlatinumTierBadge,
    DiamondTierBadge,
    MasterTierBadge
} from './TierInfo'; // TierInfo.jsx 파일 경로에 따라 수정

function RankCard({ rank, name, rating, wins, losses, tier, languageLogo }) {
    const isFirstPlace = rank === 1;

    // 언어 로고 SVG 컴포넌트 매핑 (기존 코드 유지)
    const LanguageLogoSvg = ({ type }) => {
        if (type === 'python') {
            return (
                <svg className="w-12 h-12" viewBox="0 0 256 255" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient x1="12.959%" y1="12.039%" x2="79.639%" y2="78.201%" id="a">
                            <stop stopColor="#387EB8" offset="0%" />
                            <stop stopColor="#366994" offset="100%" />
                        </linearGradient>
                        <linearGradient x1="19.128%" y1="20.579%" x2="90.742%" y2="88.429%" id="b">
                            <stop stopColor="#FFE052" offset="0%" />
                            <stop stopColor="#FFC331" offset="100%" />
                        </linearGradient>
                    </defs>
                    <path d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072zM92.802 19.66a11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13 11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.13z" fill="url(#a)" />
                    <path d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897zM162.91 234.54a11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.131 11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13z" fill="url(#b)" />
                </svg>
            );
        } else if (type === 'java') {
            return (
                <svg className="w-12 h-12" viewBox="0 0 256 346" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M82.554 267.473s-13.198 7.675 9.393 10.272c27.369 3.122 41.356 2.675 71.517-3.034 0 0 7.93 4.972 19.003 9.279-67.611 28.977-153.019-1.679-99.913-16.517"
                        fill="#5382A1"/>
                    <path
                        d="M74.292 229.659s-14.803 10.958 7.805 13.296c29.236 3.016 52.324 3.263 92.276-4.43 0 0 5.526 5.602 14.215 8.666-81.747 23.904-172.798 1.885-114.296-17.532"
                        fill="#5382A1"/>
                    <path
                        d="M143.942 165.515c16.66 19.18-4.377 36.44-4.377 36.44s42.301-21.837 22.874-49.183c-18.144-25.5-32.059-38.172 43.268-81.858 0 0-118.238 29.53-61.765 94.6"
                        fill="#E76F00"/>
                    <path
                        d="M233.364 295.442s9.767 8.047-10.757 14.273c-39.026 11.823-162.432 15.393-196.714.471-12.323-5.36 10.787-12.8 18.056-14.362 7.581-1.644 11.914-1.337 11.914-1.337-13.705-9.655-88.583 18.957-38.034 27.15 137.853 22.356 251.292-10.066 215.535-26.195"
                        fill="#5382A1"/>
                    <path
                        d="M88.9 190.48s-62.771 14.91-22.228 20.323c17.118 2.292 51.243 1.774 83.03-.89 25.978-2.19 52.063-6.85 52.063-6.85s-9.16 3.923-15.787 8.448c-63.744 16.765-186.886 8.966-151.435-8.183 29.981-14.492 54.358-12.848 54.358-12.848"
                        fill="#5382A1"/>
                    <path
                        d="M201.506 253.422c64.8-33.672 34.839-66.03 13.927-61.67-5.126 1.066-7.411 1.99-7.411 1.99s1.903-2.98 5.537-4.27c41.37-14.545 73.187 42.897-13.355 65.647 0 .001 1.003-.895 1.302-1.697"
                        fill="#5382A1"/>
                    <path
                        d="M162.439.371s35.887 35.9-34.037 91.101c-56.071 44.282-12.786 69.53-.023 98.377-32.73-29.53-56.75-55.526-40.635-79.72C111.395 74.612 176.918 57.393 162.439.37"
                        fill="#E76F00"/>
                    <path
                        d="M95.268 344.665c62.199 3.982 157.712-2.209 159.974-31.64 0 0-4.348 11.158-51.404 20.018-53.088 9.99-118.564 8.824-157.399 2.421.001 0 7.95 6.58 48.83 9.201"
                        fill="#5382A1"/>
                </svg>
            );
        } else if (type === 'cpp') {
            return (
                <svg className="w-12 h-12" viewBox="0 0 306 344" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M302.107 258.262c2.401-4.159 3.893-8.845 3.893-13.053V99.14c0-4.208-1.49-8.893-3.892-13.052L153 172.175l149.107 86.087z"
                        fill="#00599C"/>
                    <path
                        d="M166.25 341.193l126.5-73.034c3.644-2.104 6.956-5.737 9.357-9.897L153 172.175 3.893 258.263c2.401 4.159 5.714 7.793 9.357 9.896l126.5 73.034c7.287 4.208 19.213 4.208 26.5 0z"
                        fill="#004482"/>
                    <path
                        d="M302.108 86.087c-2.402-4.16-5.715-7.793-9.358-9.897L166.25 3.156c-7.287-4.208-19.213-4.208-26.5 0L13.25 76.19C5.962 80.397 0 90.725 0 99.14v146.069c0 4.208 1.491 8.894 3.893 13.053L153 172.175l149.108-86.088z"
                        fill="#659AD2"/>
                    <path
                        d="M153 274.175c-56.243 0-102-45.757-102-102s45.757-102 102-102c36.292 0 70.139 19.53 88.331 50.968l-44.143 25.544c-9.105-15.736-26.038-25.512-44.188-25.512-28.122 0-51 22.878-51 51 0 28.121 22.878 51 51 51 18.152 0 35.085-9.776 44.191-25.515l44.143 25.543c-18.192 31.441-52.04 50.972-88.334 50.972z"
                        fill="#FFF"/>
                    <path fill="#FFF"
                          d="M243 170.175h-18v-18h-18v18h-18v18h18v18h18v-18h18zM284 170.175h-18v-18h-18v18h-18v18h18v18h18v-18h18z"/>
                </svg>
            );
        }
        return null;
    };

    // 티어 뱃지 컴포넌트 동적 선택
    const TierBadgeComponent = () => {
        switch (tier.toLowerCase()) {
            case '브론즈':
                return <BronzeTierBadge />;
            case '실버':
                return <SilverTierBadge />;
            case '골드':
                return <GoldTierBadge />;
            case '플래티넘':
                return <PlatinumTierBadge />;
            case '다이아몬드':
                return <DiamondTierBadge />;
            case '마스터':
                return <MasterTierBadge />;
            default:
                return null;
        }
    };


    return (
        <div className={`main-rank-card${isFirstPlace ? '' : '1'} bg-white rounded-xl shadow-md overflow-hidden relative`}>
            <div className={`main-rank-badge ${isFirstPlace ? 'main-rank-1' : `rank-${rank}`} absolute top-0 left-0`}>{rank}</div>

            <div className={`p-4 ${isFirstPlace ? 'bg-yellow-50' : 'bg-gray-50'} border-b text-center`}>
                <h3 className="font-bold text-gray-800">{name}</h3>
            </div>
            <div className="p-4">
                <div className="flex justify-center mb-3">
                    {languageLogo && <LanguageLogoSvg type={languageLogo} />}
                </div>
                <div className="text-center mb-3">
                    <div className="text-sm text-gray-500">레이팅</div>
                    <div className="text-xl font-bold">{rating.toLocaleString()}</div>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                    <div>승: <span className="font-medium text-gray-800">{wins}</span></div>
                    <div>패: <span className="font-medium text-gray-800">{losses}</span></div>
                </div>
            </div>
            <div className="p-2 bg-gray-50 border-t text-center">
                {/* 동적으로 선택된 티어 뱃지 컴포넌트를 렌더링 */}
                <TierBadgeComponent />
            </div>
        </div>
    );
}

export default RankCard;