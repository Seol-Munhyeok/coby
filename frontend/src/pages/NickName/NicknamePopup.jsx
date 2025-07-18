import React, { useState, useEffect, useRef } from 'react';
import './NicknamePopup.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'
import { useUserStore } from '../../store/userStore'

const NicknameSetup = () => {
    const navigate = useNavigate();
    const nightSkyRef = useRef(null);
    const [nickname, setNickname] = useState('');
    const [nicknameStatus, setNicknameStatus] = useState({ message: '', type: '', isChecked: false });
    const [nicknameError, setNicknameError] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [startBtnDisable, setStartBtnDisable] = useState(false);
    const setCookieNickname = useUserStore((state) => state.setNickname)

    // 별 및 유성 생성 함수 (useEffect 내부에서 실행될 것)
    const createStars = () => {
        if (!nightSkyRef.current) return;
        const nightSky = nightSkyRef.current;
        const width = nightSky.offsetWidth;
        const height = nightSky.offsetHeight;

        // 작은 별들 생성
        for (let i = 0; i < 150; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 3 + 1;
            const duration = Math.random() * 3 + 2;
            const opacity = Math.random() * 0.5 + 0.5;

            star.style.left = `${x}px`;
            star.style.top = `${y}px`;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.setProperty('--duration', `${duration}s`);
            star.style.setProperty('--opacity', opacity);
            star.style.setProperty('--opacity-half', opacity * 0.5);
            nightSky.appendChild(star);
        }

        // 유성 생성
        for (let i = 0; i < 5; i++) {
            const shootingStar = document.createElement('div');
            shootingStar.className = 'shooting-star';
            const y = Math.random() * height;
            const angle = Math.random() * 20 - 10;
            const delay = Math.random() * 15;
            const duration = Math.random() * 3 + 2;

            shootingStar.style.top = `${y}px`;
            shootingStar.style.setProperty('--angle', `${angle}deg`);
            shootingStar.style.setProperty('--delay', `${delay}s`);
            shootingStar.style.setProperty('--duration', `${duration}s`);
            nightSky.appendChild(shootingStar);
        }
    };

    // 카드 위치 정렬 함수 (useEffect 내부에서 실행될 것)
    const arrangeNicknameCards = () => {
        if (!nightSkyRef.current) return;
        const nightSky = nightSkyRef.current;
        const containerWidth = nightSky.offsetWidth;
        const containerHeight = nightSky.offsetHeight;

        const pythonCard = document.getElementById('pythonCard');
        const javaCard = document.getElementById('javaCard');
        const cppCard = document.getElementById('cppCard');

        if (!pythonCard || !javaCard || !cppCard) return;

        const cardWidth = pythonCard.offsetWidth;
        const cardHeight = pythonCard.offsetHeight;

        const totalWidth = cardWidth * 3 + 40; // 카드 3개 + 간격
        const startX = (containerWidth - totalWidth) / 2;
        const centerY = (containerHeight - cardHeight) / 2;

        pythonCard.style.left = `${startX}px`;
        pythonCard.style.top = `${centerY}px`;

        javaCard.style.left = `${startX + cardWidth + 20}px`;
        javaCard.style.top = `${centerY}px`;

        cppCard.style.left = `${startX + (cardWidth + 20) * 2}px`;
        cppCard.style.top = `${centerY}px`;
    };


    // 닉네임 유효성 검사
    const validateNickname = (inputNickname) => {
        const regex = /^[가-힣a-zA-Z0-9]{2,12}$/;
        return regex.test(inputNickname);
    };
    

    // 닉네임 중복 확인 핸들러
    const handleCheckNickname = async () => { // async 키워드 추가
        const trimmedNickname = nickname.trim();

        if (!validateNickname(trimmedNickname)) {
            setNicknameError('닉네임은 2~12자 이내의 한글, 영문, 숫자만 사용 가능합니다.');
            setNicknameStatus({ message: '', type: '', isChecked: false });
            return;
        }

        setNicknameError('');
        setNicknameStatus({ message: '확인 중...', type: 'text-blue-500', isChecked: false });

        try {
            console.log('닉네임 중복 확인 요청:', `${process.env.REACT_APP_API_URL}/api/users/check-nickname?nickname=${trimmedNickname}`); // 요청 URL 로깅
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/check-nickname?nickname=${trimmedNickname}`);
            const data = await response.json();
            console.log('닉네임 중복 확인 응답 데이터:', data); // 응답 데이터 로깅

            if (response.ok) {
                if (data.available) {
                    setNicknameStatus({ message: data.message, type: 'text-green-500', isChecked: true });
                } else {
                    setNicknameStatus({ message: data.message, type: 'text-red-500', isChecked: false });
                }
            } else {
                // 서버에서 오류 응답 (예: 400 Bad Request)을 보낸 경우
                setNicknameStatus({ message: data.message || '닉네임 확인 중 오류가 발생했습니다.', type: 'text-red-500', isChecked: false });
            }
        } catch (error) {
            console.error('닉네임 중복 확인 중 오류 발생:', error); // 에러 객체 로깅
            setNicknameStatus({ message: '서버와 통신 중 오류가 발생했습니다.', type: 'text-red-500', isChecked: false });
        }
    };

    // 언어 카드 클릭 핸들러
    const handleCardClick = (language) => {
        setSelectedLanguage(language);
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('selected');
        });
        document.getElementById(`${language}Card`).classList.add('selected');
    };

    // "시작하기" 버튼 클릭 핸들러
    const goTomainPage = async () => { // async 키워드 추가
        setStartBtnDisable(true); //중복 클릭 방지

        try {
            // 서버에 닉네임 저장 PUT 요청
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/nickname`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    // 필요하다면 인증 토큰 등을 추가
                    // 'Authorization': `Bearer ${yourAuthToken}`
                },
                body: JSON.stringify({ 
                    nickname: nickname,
                    selectedLanguage: selectedLanguage
                 })
            });

            if (response.ok) {
                console.log('닉네임이 성공적으로 저장되었습니다.');
                Cookies.set('nickname', nickname, { expires: 1 }) // 1일 유지
                setCookieNickname(nickname) //닉네임을 쿠키에 저장

                setTimeout(() => { // 1.5초 후 페이지 이동 (시뮬레이션)
                    navigate('/mainpage');
                }, 1500);

            } else {
                const errorData = await response.json();
                console.error('닉네임 저장 실패:', errorData.message || '알 수 없는 오류');
                setNicknameError('닉네임 저장에 실패했습니다. 다시 시도해주세요.');
                setStartBtnDisable(false); // 오류 발생 시 버튼 활성화
            }
        } catch (error) {
            console.error('네트워크 오류:', error);
            setNicknameError('서버와 통신 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.');
            setStartBtnDisable(false); // 오류 발생 시 버튼 활성화
        }
    };

    // 프로필 제출 핸들러 (폼 제출 시)
    const handleSubmitProfile = (event) => {
        event.preventDefault(); // 폼 기본 제출 동작 방지
    
        const trimmedNickname = nickname.trim();
    
        if (!validateNickname(trimmedNickname)) {
            setNicknameError('닉네임은 2~12자 이내의 한글, 영문, 숫자만 사용 가능합니다.');
            setTimeout(() => {
                setNicknameError('');
            }, 2000); 
            return;
        }
    
        if (!nicknameStatus.isChecked) {
            setNicknameError('닉네임 중복 확인을 해주세요.');
            setTimeout(() => {
                setNicknameError('');
            }, 2000);
            return;
        }
    
        if (!selectedLanguage) {
            setNicknameError('주 사용 언어를 선택해주세요.');
            setTimeout(() => {
                setNicknameError('');
            }, 2000);
            return; 
        }
    
        // 모든 유효성 검사를 통과했을 때만 실행
        setNicknameError(''); 
        console.log(`환영합니다, ${trimmedNickname}님! 선택하신 언어는 ${selectedLanguage}입니다.`);
    
        goTomainPage(); // 모든 조건이 충족되면 메인 페이지로 이동
    };

    // 컴포넌트 마운트 시 별 생성 및 카드 정렬
    useEffect(() => {
        createStars();
        arrangeNicknameCards();

        // 창 크기 변경 시 카드 위치 재조정
        const handleResize = () => arrangeNicknameCards();
        window.addEventListener('resize', handleResize);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []); // 빈 배열: 컴포넌트가 처음 마운트될 때만 실행

    // 선택된 언어에 따른 아이콘 및 텍스트 렌더링
    const renderLanguageDisplay = () => {
        let iconSvg = '';
        let languageText = '오른쪽 카드를 클릭하여 언어를 선택하세요';

        switch (selectedLanguage) {
            case 'python':
                iconSvg = `
                    <svg width="24" height="24" viewBox="0 0 256 255" xmlns="http://www.w3.org/2000/svg">
                        <path d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072z" fill="#387EB8"/>
                        <path d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897z" fill="#FFE052"/>
                    </svg>
                `;
                languageText = 'Python';
                break;
            case 'java':
                iconSvg = `
                    <svg width="24" height="24" viewBox="0 0 256 346" xmlns="http://www.w3.org/2000/svg">
                        <path d="M82.554 267.473s-13.198 7.675 9.393 10.272c27.369 3.122 41.356 2.675 71.517-3.034 0 0 7.93 4.972 19.003 9.279-67.611 28.977-153.019-1.679-99.913-16.517" fill="#5382A1"/>
                        <path d="M74.292 229.659s-14.803 10.958 7.805 13.296c29.236 3.016 52.324 3.263 92.276-4.43 0 0 5.526 5.602 14.215 8.666-81.747 23.904-172.798 1.885-114.296-17.532" fill="#5382A1"/>
                        <path d="M143.942 165.515c16.66 19.18-4.377 36.44-4.377 36.44s42.301-21.837 22.874-49.183c-18.144-25.5-32.059-38.172 43.268-81.858 0 0-118.238 29.53-61.765 94.6" fill="#E76F00"/>
                        <path d="M233.364 295.442s9.767 8.047-10.757 14.273c-39.026 11.823-162.432 15.393-196.714.471-12.323-5.36 10.787-12.8 18.056-14.362 7.581-1.644 11.914-1.337 11.914-1.337-13.705-9.655-88.583 18.957-38.034 27.15 137.853 22.356 251.292-10.066 215.535-26.195" fill="#5382A1"/>
                        <path d="M88.9 190.48s-62.771 14.91-22.228 20.323c17.118 2.292 51.243 1.774 83.03-.89 25.978-2.19 52.063-6.85 52.063-6.85s-9.16 3.923-15.787 8.448c-63.744 16.765-186.886 8.966-151.435-8.183 29.981-14.492 54.358-12.848 54.358-12.848" fill="#5382A1"/>
                        <path d="M201.506 253.422c64.8-33.672 34.839-66.03 13.927-61.67-5.126 1.066-7.411 1.99-7.411 1.99s1.903-2.98 5.537-4.27c41.37-14.545 73.187 42.897-13.355 65.647 0 .001 1.003-.895 1.302-1.697" fill="#5382A1"/>
                        <path d="M162.439.371s35.887 35.9-34.037 91.101c-56.071 44.282-12.786 69.53-.023 98.377-32.73-29.53-56.75-55.526-40.635-79.72C111.395 74.612 176.918 57.393 162.439.37" fill="#E76F00"/>
                        <path d="M95.268 344.665c62.199 3.982 157.712-2.209 159.974-31.64 0 0-4.348 11.158-51.404 20.018-53.088 9.99-118.564 8.824-157.399 2.421.001 0 7.95 6.58 48.83 9.201" fill="#5382A1"/>
                    </svg>
                `;
                languageText = 'Java';
                break;
            case 'cpp':
                iconSvg = `
                    <svg width="24" height="24" viewBox="0 0 306 344" xmlns="http://www.w3.org/2000/svg">
                        <path d="M302.107 258.262c2.401-4.159 3.893-8.845 3.893-13.053V99.14c0-4.208-1.49-8.893-3.892-13.052L153 172.175l149.107 86.087z" fill="#00599C"/>
                        <path d="M166.25 341.193l126.5-73.034c3.644-2.104 6.956-5.737 9.357-9.897L153 172.175 3.893 258.263c2.401 4.159 5.714 7.793 9.357 9.896l126.5 73.034c7.287 4.208 19.213 4.208 26.5 0z" fill="#004482"/>
                        <path d="M302.108 86.087c-2.402-4.16-5.715-7.793-9.358-9.897L166.25 3.156c-7.287-4.208-19.213-4.208-26.5 0L13.25 76.19C5.962 80.397 0 90.725 0 99.14v146.069c0 4.208 1.491 8.894 3.893 13.053L153 172.175l149.108-86.088z" fill="#659AD2"/>
                        <path d="M153 274.175c-56.243 0-102-45.757-102-102s45.757-102 102-102c36.292 0 70.139 19.53 88.331 50.968l-44.143 25.544c-9.105-15.736-26.038-25.512-44.188-25.512-28.122 0-51 22.878-51 51 0 28.121 22.878 51 51 51 18.152 0 35.085-9.776 44.191-25.515l44.143 25.543c-18.192 31.441-52.04 50.972-88.334 50.972z" fill="#FFF"/>
                        <path fill="#FFF" d="M243 170.175h-18v-18h-18v18h-18v18h18v18h18v-18h18zM284 170.175h-18v-18h-18v18h-18v18h18v18h18v-18h18z"/>
                    </svg>
                `;
                languageText = 'C++';
                break;
            default:
                iconSvg = '';
                languageText = '오른쪽 카드를 클릭하여 언어를 선택하세요';
        }
        return (
            <>
                <div className="mr-2" dangerouslySetInnerHTML={{ __html: iconSvg }} />
                <span>{languageText}</span>
            </>
        );
    };

    return (
        <div className="main-container">
            {/* Left side - Nickname Section */}
            <div className="nickname-section w-full md:w-1/3">
                <div className="mb-8">
                    <h1 className="logo-text text-4xl font-black text-gray-800 mb-2">COBY</h1>
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">닉네임 설정</h2>
                    <p className="text-gray-600">COBY에서 사용할 닉네임을 입력해주세요.</p>
                </div>

                <div className="w-full max-w-md">
                    <form id="profileForm" onSubmit={handleSubmitProfile}>
                        <div className="mb-6">
                            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
                            <div className="flex">
                                <input
                                    type="text"
                                    id="nickname"
                                    name="nickname"
                                    className="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="닉네임을 입력하세요"
                                    value={nickname}
                                    onChange={(e) => {
                                        setNickname(e.target.value);
                                        setNicknameStatus({ message: '', type: '', isChecked: false }); // 닉네임 변경 시 중복 확인 초기화
                                        setNicknameError(''); // 닉네임 변경 시 오류 메시지 초기화
                                    }}
                                    required
                                />
                                <button type="button" className="btn-check px-4 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700" onClick={handleCheckNickname}>중복확인</button>
                            </div>
                            <div id="nicknameStatus" className={`text-sm mt-1 ${nicknameStatus.type} ${!nicknameStatus.message && 'hidden'}`}>
                                {nicknameStatus.message}
                            </div>
                            <div id="nicknameError" className={`text-red-500 text-sm mt-1 ${!nicknameError && 'hidden'}`}>
                                {nicknameError}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">주 사용 언어</label>
                            <div id="selectedLanguageDisplay" className="flex items-center p-3 bg-gray-100 rounded-lg mb-2">
                                {renderLanguageDisplay()}
                            </div>
                        </div>

                        <div className="mb-8">
                            <button type="submit" className="btn-submit w-full py-4 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors" disabled={startBtnDisable}>시작하기</button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">닉네임 생성 정책</h3>
                        <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5">
                            <li>2~12자 이내의 한글, 영문, 숫자만 사용 가능합니다.</li>
                            <li>욕설, 비속어, 성적인 표현이 포함된 닉네임은 사용할 수 없습니다.</li>
                            <li>타인을 사칭하거나 혐오를 조장하는 닉네임은 제한됩니다.</li>
                            <li>개인정보(전화번호, 주소 등)가 포함된 닉네임은 사용할 수 없습니다.</li>
                            <li>운영정책에 위배되는 닉네임은 임의로 변경될 수 있습니다.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Right side - Night Sky Section with Cards */}
            <div className="night-sky w-full md:w-2/3" ref={nightSkyRef}>
                {/* Stars will be added by JavaScript (via useEffect) */}

                {/* Python Card */}
                <div
                    className={`card bg-white rounded-xl border-8 border-white overflow-hidden ${selectedLanguage === 'python' ? 'selected' : ''}`}
                    id="pythonCard"
                    data-language="python"
                    onClick={() => handleCardClick('python')}
                >
                    <div className="h-full card-pattern bg-blue-100 flex flex-col">
                        <div className="p-4">
                            <div className="text-xl font-bold text-blue-800">Python</div>
                        </div>
                        <div className="logo-container">
                            <svg className="language-logo" viewBox="0 0 256 255" xmlns="http://www.w3.org/2000/svg">
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
                                <path d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897zm34.114-19.586a11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.131 11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13z" fill="url(#b)" />
                            </svg>
                        </div>
                        <div className="p-4 flex justify-end">
                            <div className="text-xl font-bold text-blue-800 transform rotate-180">Python</div>
                        </div>
                    </div>
                </div>

                {/* Java Card */}
                <div
                    className={`card bg-white rounded-xl border-8 border-white overflow-hidden ${selectedLanguage === 'java' ? 'selected' : ''}`}
                    id="javaCard"
                    data-language="java"
                    onClick={() => handleCardClick('java')}
                >
                    <div className="h-full card-pattern bg-red-100 flex flex-col">
                        <div className="p-4">
                            <div className="text-xl font-bold text-red-600">Java</div>
                        </div>
                        <div className="logo-container">
                            <svg className="language-logo" viewBox="0 0 256 346" xmlns="http://www.w3.org/2000/svg">
                                <path d="M82.554 267.473s-13.198 7.675 9.393 10.272c27.369 3.122 41.356 2.675 71.517-3.034 0 0 7.93 4.972 19.003 9.279-67.611 28.977-153.019-1.679-99.913-16.517M74.292 229.659s-14.803 10.958 7.805 13.296c29.236 3.016 52.324 3.263 92.276-4.43 0 0 5.526 5.602 14.215 8.666-81.747 23.904-172.798 1.885-114.296-17.532" fill="#5382A1" />
                                <path d="M143.942 165.515c16.66 19.18-4.377 36.44-4.377 36.44s42.301-21.837 22.874-49.183c-18.144-25.5-32.059-38.172 43.268-81.858 0 0-118.238 29.53-61.765 94.6" fill="#E76F00" />
                                <path d="M233.364 295.442s9.767 8.047-10.757 14.273c-39.026 11.823-162.432 15.393-196.714.471-12.323-5.36 10.787-12.8 18.056-14.362 7.581-1.644 11.914-1.337 11.914-1.337-13.705-9.655-88.583 18.957-38.034 27.15 137.853 22.356 251.292-10.066 215.535-26.195M88.9 190.48s-62.771 14.91-22.228 20.323c17.118 2.292 51.243 1.774 83.03-.89 25.978-2.19 52.063-6.85 52.063-6.85s-9.16 3.923-15.787 8.448c-63.744 16.765-186.886 8.966-151.435-8.183 29.981-14.492 54.358-12.848 54.358-12.848M201.506 253.422c64.8-33.672 34.839-66.03 13.927-61.67-5.126 1.066-7.411 1.99-7.411 1.99s1.903-2.98 5.537-4.27c41.37-14.545 73.187 42.897-13.355 65.647 0 .001 1.003-.895 1.302-1.697" fill="#5382A1" />
                                <path d="M162.439.371s35.887 35.9-34.037 91.101c-56.071 44.282-12.786 69.53-.023 98.377-32.73-29.53-56.75-55.526-40.635-79.72C111.395 74.612 176.918 57.393 162.439.37" fill="#E76F00" />
                                <path d="M95.268 344.665c62.199 3.982 157.712-2.209 159.974-31.64 0 0-4.348 11.158-51.404 20.018-53.088 9.99-118.564 8.824-157.399 2.421.001 0 7.95 6.58 48.83 9.201" fill="#5382A1" />
                            </svg>
                        </div>
                        <div className="p-4 flex justify-end">
                            <div className="text-xl font-bold text-red-600 transform rotate-180">Java</div>
                        </div>
                    </div>
                </div>

                {/* C++ Card */}
                <div
                    className={`card bg-white rounded-xl border-8 border-white overflow-hidden ${selectedLanguage === 'cpp' ? 'selected' : ''}`}
                    id="cppCard"
                    data-language="cpp"
                    onClick={() => handleCardClick('cpp')}
                >
                    <div className="h-full card-pattern bg-blue-200 flex flex-col">
                        <div className="p-4">
                            <div className="text-xl font-bold text-blue-700">C++</div>
                        </div>
                        <div className="logo-container">
                            <svg className="language-logo" viewBox="0 0 306 344" xmlns="http://www.w3.org/2000/svg">
                                <path d="M302.107 258.262c2.401-4.159 3.893-8.845 3.893-13.053V99.14c0-4.208-1.49-8.893-3.892-13.052L153 172.175l149.107 86.087z" fill="#00599C" />
                                <path d="M166.25 341.193l126.5-73.034c3.644-2.104 6.956-5.737 9.357-9.897L153 172.175 3.893 258.263c2.401 4.159 5.714 7.793 9.357 9.896l126.5 73.034c7.287 4.208 19.213 4.208 26.5 0z" fill="#004482" />
                                <path d="M302.108 86.087c-2.402-4.16-5.715-7.793-9.358-9.897L166.25 3.156c-7.287-4.208-19.213-4.208-26.5 0L13.25 76.19C5.962 80.397 0 90.725 0 99.14v146.069c0 4.208 1.491 8.894 3.893 13.053L153 172.175l149.108-86.088z" fill="#659AD2" />
                                <path d="M153 274.175c-56.243 0-102-45.757-102-102s45.757-102 102-102c36.292 0 70.139 19.53 88.331 50.968l-44.143 25.544c-9.105-15.736-26.038-25.512-44.188-25.512-28.122 0-51 22.878-51 51 0 28.121 22.878 51 51 51 18.152 0 35.085-9.776 44.191-25.515l44.143 25.543c-18.192 31.441-52.04 50.972-88.334 50.972z" fill="#FFF" />
                                <path fill="#FFF" d="M243 170.175h-18v-18h-18v18h-18v18h18v18h18v-18h18zM284 170.175h-18v-18h-18v18h-18v18h18v18h18v-18h18z" />
                            </svg>
                        </div>
                        <div className="p-4 flex justify-end">
                            <div className="text-xl font-bold text-blue-700 transform rotate-180">C++</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default NicknameSetup;