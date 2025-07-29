import React, { useEffect, useRef, useState } from 'react';
import './Login.css';
import axios from 'axios';
import Cookies from 'js-cookie';
import { PythonCard, JavaCard, CppCard } from '../../Common/components/LanguageCards';


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
                <PythonCard />
                {/* Java Card */}
                <JavaCard />
                {/* C++ Card */}
                <CppCard />
            </div>
        </div>
    );
};

export default CobyLoginPage;