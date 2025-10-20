import React, { useState } from 'react';
import axios from 'axios';



const PasswordModal = ({ show, onClose, roomId, onVerifySuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!show) return null;

    const handleVerify = async () => {
        if (password.trim() === '') {
            setError('비밀번호를 입력해주세요.');
            return;
        }

        setError('');
        try {
            await axios.post(`/api/rooms/${roomId}/verify-password`, {
                password: password,
            });

            onVerifySuccess(roomId);
            onClose();

        } catch (err) {
            setError('비밀번호가 일치하지 않습니다.');
        } finally {
            setPassword(''); // 비밀번호 입력 필드 초기화
        }
    };

    // 모달 UI (Tailwind CSS 사용)
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
                <h3 className="text-xl font-bold mb-4 text-gray-800">🔒 비밀번호 입력</h3>
                <p className="mb-4 text-gray-600">비공개 방에 입장하려면 비밀번호를 입력해주세요.</p>
                <input
                    type="password"
                    placeholder="비밀번호"
                    className="w-full border rounded-lg px-3 py-2 mb-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') handleVerify();
                    }}
                />
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <div className="flex justify-end space-x-3 mt-4">
                    <button
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                        onClick={() => {
                            onClose();
                            setPassword('');
                            setError('');
                        }}
                    >
                        취소
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        onClick={handleVerify}
                        disabled={!password.trim()}
                    >
                        입장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PasswordModal;