import React, { useEffect, useRef, useState } from 'react';
import './Login.css';
//import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // axios를 사용하기 위해 추가
import Cookies from 'js-cookie'; // Cookies 임포트

const CobyLoginPage = () => {
    const nightSkyRef = useRef(null);
    const cardsRef = useRef([]);
    const handleGoogleLogin = () => {
        window.location.href = `${process.env.REACT_APP_API_URL}/oauth2/authorization/google`;
    };

    const handleKakaoLogin = () => {
        window.location.href = `${process.env.REACT_APP_API_URL}/oauth2/authorization/kakao`;
    };

    useEffect(() => {
        // Create stars and shooting stars
        const createStars = () => {
            const nightSky = nightSkyRef.current;
            if (!nightSky) return;

            const width = nightSky.offsetWidth;
            const height = nightSky.offsetHeight;

            // Clear existing stars to prevent duplicates on re-render if component unmounts and mounts
            nightSky.querySelectorAll('.star').forEach(el => el.remove());
            nightSky.querySelectorAll('.shooting-star').forEach(el => el.remove());

            // Small stars
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
                star.style.setProperty('--opacity', String(opacity));
                star.style.setProperty('--opacity-half', String(opacity * 0.5));
                nightSky.appendChild(star);
            }

            // Shooting stars
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

        createStars();

        // Handle card animations
        class Card {
            constructor(element, container) {
                this.element = element;
                this.container = container;
                this.width = element.offsetWidth;
                this.height = element.offsetHeight;
                this.mass = (this.width * this.height) / 10000;

                this.x = Math.random() * (container.offsetWidth - this.width);
                this.y = Math.random() * (container.offsetHeight - this.height);

                this.vx = (Math.random() - 0.5) * 500;
                this.vy = (Math.random() - 0.5) * 500;

                this.lastTimestamp = 0;
                this.dragging = false;

                this.onMouseDown = this.onMouseDown.bind(this);
                this.onMouseMove = this.onMouseMove.bind(this);
                this.onMouseUp = this.onMouseUp.bind(this);
                this.onTouchStart = this.onTouchStart.bind(this);
                this.onTouchMove = this.onTouchMove.bind(this);
                this.onTouchEnd = this.onTouchEnd.bind(this);

                this.element.addEventListener('mousedown', this.onMouseDown);
                document.addEventListener('mousemove', this.onMouseMove);
                document.addEventListener('mouseup', this.onMouseUp);
                this.element.addEventListener('touchstart', this.onTouchStart, { passive: false });
                document.addEventListener('touchmove', this.onTouchMove, { passive: false });
                document.addEventListener('touchend', this.onTouchEnd);

                this.updatePosition();
            }

            onMouseDown(e) {
                e.preventDefault();
                this.dragging = true;
                this.dragStartX = e.clientX - this.x;
                this.dragStartY = e.clientY - this.y;
                this.element.style.zIndex = '20';
                this.vx = 0;
                this.vy = 0;
            }

            onMouseMove(e) {
                if (!this.dragging) return;
                this.x = e.clientX - this.dragStartX;
                this.y = e.clientY - this.dragStartY;
                this.checkBoundaries();
                this.updatePosition();
            }

            onMouseUp(e) {
                if (!this.dragging) return;
                this.dragging = false;
                this.element.style.zIndex = '5';

                if (this.lastMouseX && this.lastMouseY) {
                    const dx = e.clientX - this.lastMouseX;
                    const dy = e.clientY - this.lastMouseY;
                    const maxSpeed = 800;
                    this.vx = Math.max(Math.min(dx * 10, maxSpeed), -maxSpeed);
                    this.vy = Math.max(Math.min(dy * 10, maxSpeed), -maxSpeed);
                } else {
                    this.vx = (Math.random() - 0.5) * 300;
                    this.vy = (Math.random() - 0.5) * 300;
                }
                this.lastMouseX = null;
                this.lastMouseY = null;
            }

            onTouchStart(e) {
                e.preventDefault();
                if (e.touches.length === 1) {
                    this.dragging = true;
                    this.dragStartX = e.touches[0].clientX - this.x;
                    this.dragStartY = e.touches[0].clientY - this.y;
                    this.element.style.zIndex = '20';
                    this.vx = 0;
                    this.vy = 0;
                    this.lastTouchX = e.touches[0].clientX;
                    this.lastTouchY = e.touches[0].clientY;
                }
            }

            onTouchMove(e) {
                if (!this.dragging) return;
                e.preventDefault();

                if (e.touches.length === 1) {
                    const currentX = e.touches[0].clientX;
                    const currentY = e.touches[0].clientY;

                    if (this.lastTouchX && this.lastTouchY) {
                        const dx = currentX - this.lastTouchX;
                        const dy = currentY - this.lastTouchY;
                        this.lastTouchDX = dx;
                        this.lastTouchDY = dy;
                    }
                    this.lastTouchX = currentX;
                    this.lastTouchY = currentY;

                    this.x = currentX - this.dragStartX;
                    this.y = currentY - this.dragStartY;
                    this.checkBoundaries();
                    this.updatePosition();
                }
            }

            onTouchEnd() {
                if (!this.dragging) return;
                this.dragging = false;
                this.element.style.zIndex = '5';

                if (this.lastTouchDX && this.lastTouchDY) {
                    const maxSpeed = 800;
                    this.vx = Math.max(Math.min(this.lastTouchDX * 10, maxSpeed), -maxSpeed);
                    this.vy = Math.max(Math.min(this.lastTouchDY * 10, maxSpeed), -maxSpeed);
                } else {
                    this.vx = (Math.random() - 0.5) * 300;
                    this.vy = (Math.random() - 0.5) * 300;
                }
                this.lastTouchX = null;
                this.lastTouchY = null;
                this.lastTouchDX = null;
                this.lastTouchDY = null;
            }

            checkBoundaries() {
                const containerWidth = this.container.offsetWidth;
                const containerHeight = this.container.offsetHeight;

                if (this.x < 0) {
                    this.x = 0;
                } else if (this.x + this.width > containerWidth) {
                    this.x = containerWidth - this.width;
                }

                if (this.y < 0) {
                    this.y = 0;
                } else if (this.y + this.height > containerHeight) {
                    this.y = containerHeight - this.height;
                }
            }

            update(timestamp) {
                if (this.dragging) return;

                if (!this.lastTimestamp) {
                    this.lastTimestamp = timestamp;
                    return;
                }

                const deltaTime = (timestamp - this.lastTimestamp) / 1000;
                this.lastTimestamp = timestamp;

                this.x += this.vx * deltaTime;
                this.y += this.vy * deltaTime;

                const containerWidth = this.container.offsetWidth;
                const containerHeight = this.container.offsetHeight;

                if (this.x < 0) {
                    this.x = 0;
                    this.vx = -this.vx * 0.9;
                } else if (this.x + this.width > containerWidth) {
                    this.x = containerWidth - this.width;
                    this.vx = -this.vx * 0.9;
                }

                if (this.y < 0) {
                    this.y = 0;
                    this.vy = -this.vy * 0.9;
                } else if (this.y + this.height > containerHeight) {
                    this.y = containerHeight - this.height;
                    this.vy = -this.vy * 0.9;
                }

                this.vx *= 0.998;
                this.vy *= 0.998;

                if (Math.abs(this.vx) < 10 && Math.abs(this.vy) < 10) {
                    if (Math.random() < 0.05) {
                        this.vx = (Math.random() - 0.5) * 150;
                        this.vy = (Math.random() - 0.5) * 150;
                    }
                }
                this.updatePosition();
            }

            updatePosition() {
                this.element.style.left = `${this.x}px`;
                this.element.style.top = `${this.y}px`;
            }

            getBounds() {
                return {
                    left: this.x,
                    right: this.x + this.width,
                    top: this.y,
                    bottom: this.y + this.height,
                    centerX: this.x + this.width / 2,
                    centerY: this.y + this.height / 2,
                };
            }

            // Cleanup event listeners
            destroy() {
                this.element.removeEventListener('mousedown', this.onMouseDown);
                document.removeEventListener('mousemove', this.onMouseMove);
                document.removeEventListener('mouseup', this.onMouseUp);
                this.element.removeEventListener('touchstart', this.onTouchStart);
                document.removeEventListener('touchmove', this.onTouchMove);
                document.removeEventListener('touchend', this.onTouchEnd);
            }
        }

        const checkCollisions = (cards) => {
            for (let i = 0; i < cards.length; i++) {
                for (let j = i + 1; j < cards.length; j++) {
                    const card1 = cards[i];
                    const card2 = cards[j];

                    if (card1.dragging || card2.dragging) continue;

                    const bounds1 = card1.getBounds();
                    const bounds2 = card2.getBounds();

                    if (
                        bounds1.left < bounds2.right &&
                        bounds1.right > bounds2.left &&
                        bounds1.top < bounds2.bottom &&
                        bounds1.bottom > bounds2.top
                    ) {
                        const dx = bounds1.centerX - bounds2.centerX;
                        const dy = bounds1.centerY - bounds2.centerY;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        const nx = dx / distance;
                        const ny = dy / distance;

                        const dvx = card1.vx - card2.vx;
                        const dvy = card1.vy - card2.vy;

                        const dotProduct = dvx * nx + dvy * ny;

                        if (dotProduct > 0) continue;

                        const restitution = 0.9;
                        const impulse =
                            (-(1 + restitution) * dotProduct) / (1 / card1.mass + 1 / card2.mass);

                        card1.vx += (impulse * nx) / card1.mass;
                        card1.vy += (impulse * ny) / card1.mass;
                        card2.vx -= (impulse * nx) / card2.mass;
                        card2.vy -= (impulse * ny) / card2.mass;

                        const overlap = 5;
                        const penetrationDepth =
                            (card1.width + card2.width) / 2 - distance + overlap;

                        if (penetrationDepth > 0) {
                            const percent = 0.2;
                            const separationX = nx * penetrationDepth * percent;
                            const separationY = ny * penetrationDepth * percent;

                            card1.x += separationX;
                            card1.y += separationY;
                            card2.x -= separationX;
                            card2.y -= separationY;

                            card1.updatePosition();
                            card2.updatePosition();
                        }
                    }
                }
            }
        };

        let animationFrameId;

        const animate = (timestamp) => {
            cardsRef.current.forEach((card) => card.update(timestamp));
            checkCollisions(cardsRef.current);
            animationFrameId = requestAnimationFrame(animate);
        };
      

        const initCards = () => {
            const nightSky = nightSkyRef.current;
            if (!nightSky) return;

            // Clear previous card instances to prevent memory leaks
            cardsRef.current.forEach(card => card.destroy());
            cardsRef.current = [];

            const cardElements = nightSky.querySelectorAll('.card');
            cardsRef.current = Array.from(cardElements).map((element) => new Card(element, nightSky));

            positionCardsWithoutOverlap();
            animationFrameId = requestAnimationFrame(animate);
        };

        const positionCardsWithoutOverlap = () => {
            const nightSky = nightSkyRef.current;
            if (!nightSky) return;

            const containerWidth = nightSky.offsetWidth;
            const containerHeight = nightSky.offsetHeight;

            for (let i = 0; i < cardsRef.current.length; i++) {
                const card = cardsRef.current[i];
                let attempts = 0;
                let overlapping = true;

                while (overlapping && attempts < 50) {
                    card.x = Math.random() * (containerWidth - card.width);
                    card.y = Math.random() * (containerHeight - card.height);

                    overlapping = false;

                    for (let j = 0; j < i; j++) {
                        const otherCard = cardsRef.current[j];
                        const bounds1 = card.getBounds();
                        const bounds2 = otherCard.getBounds();

                        if (
                            bounds1.left < bounds2.right &&
                            bounds1.right > bounds2.left &&
                            bounds1.top < bounds2.bottom &&
                            bounds1.bottom > bounds2.top
                        ) {
                            overlapping = true;
                            break;
                        }
                    }
                    attempts++;
                }
                card.updatePosition();
            }
        };
         

        initCards();

        const handleResize = () => {
            const nightSky = nightSkyRef.current;
            if (!nightSky) return;

            const containerWidth = nightSky.offsetWidth;
            const containerHeight = nightSky.offsetHeight;

            cardsRef.current.forEach((card) => {
                if (card.x + card.width > containerWidth) {
                    card.x = containerWidth - card.width;
                }
                if (card.y + card.height > containerHeight) {
                    card.y = containerHeight - card.height;
                }
                card.updatePosition();
            });
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function for useEffect
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            cardsRef.current.forEach(card => card.destroy()); // Ensure all event listeners on cards are removed
        };
    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

   

    return (
        <div className="main-container">
            {/* Left side - Login Section */}
            <div className="login-section w-full md:w-1/3">
                <div className="mb-12 text-center">
                    <h1 className="logo-text text-6xl font-black text-gray-800 mb-2">COBY</h1>
                    <p className="logo-meaning text-blue-600 font-medium mb-4">Coding Online Battle With You</p>
                    <p className="text-xl text-gray-600">코딩 대결 플랫폼에 오신 것을 환영합니다</p>
                </div>

                <div className="w-full max-w-xs space-y-6">
                    {/* Kakao Login Button */}
                    <button className="btn-sso flex items-center justify-center py-4 px-6 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium w-full" onClick={handleKakaoLogin}>
                        <span className="mr-3">
                            <svg width="24" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                                <path d="M128 36C70.562 36 24 72.713 24 118c0 29.279 19.466 54.97 48.748 69.477-1.593 5.494-10.237 35.344-10.581 37.689 0 0-.207 1.762.934 2.434s2.483.15 2.483.15c3.272-.431 37.959-24.811 43.817-29.076 6.641.863 13.449 1.326 20.599 1.326 57.438 0 104-36.712 104-82 0-45.287-46.562-82-104-82z" />
                            </svg>
                        </span>
                        카카오로 로그인
                    </button>

                    {/* Google Login Button */}
                    <button className="btn-sso flex items-center justify-center py-4 px-6 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium w-full" onClick={handleGoogleLogin}>
                        <span className="mr-3">
                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        </span>
                        구글로 로그인
                    </button>
                </div>
            </div>

            {/* Right side - Night Sky Section */}
            <div className="night-sky w-full md:w-2/3" id="nightSky" ref={nightSkyRef}>
                {/* Python Card */}
                <div className="card bg-white rounded-xl border-8 border-white overflow-hidden" id="pythonCard">
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
                <div className="card bg-white rounded-xl border-8 border-white overflow-hidden" id="javaCard">
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
                <div className="card bg-white rounded-xl border-8 border-white overflow-hidden" id="cppCard">
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

export default CobyLoginPage;
