import React, { useState } from 'react';
import './NicknamePopup.css';

const usedNicknames = ['admin', 'test', '게임마스터'];

const NicknamePopup = () => {
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const checkDuplicate = () => {
    if (nickname.length < 2 || nickname.length > 12) {
      setMessage({ text: '닉네임은 2~12자 이내로 입력해주세요.', type: 'error' });
      return;
    }
    const regex = /^[가-힣a-zA-Z0-9]+$/;
    if (!regex.test(nickname)) {
      setMessage({ text: '한글, 영문, 숫자만 사용 가능합니다.', type: 'error' });
      return;
    }
    if (usedNicknames.includes(nickname)) {
      setMessage({ text: '이미 사용 중인 닉네임입니다.', type: 'error' });
    } else {
      setMessage({ text: '사용 가능한 닉네임입니다!', type: 'success' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.type !== 'success') {
      setMessage({ text: '닉네임 중복 확인을 먼저 해주세요.', type: 'error' });
      return;
    }
    alert(`환영합니다, ${nickname}님! 닉네임이 성공적으로 설정되었습니다.`);
    window.location.href = '3-main.html';
  };

  return (
    <div className="nickname-body">
      <div className="overlay">
        <div className="popup-container">
          <div className="logo">
            <img src="그림2.png" alt="logo" width="150" style={{ margin: 'auto' }} />
          </div>
          <p class="nickname-description">
            COBY에서 사용할 <span class="nickname-highlight">닉네임</span>을 설정해주세요.
          </p>

          {message.text && (
            <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
              <div className="flex">
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  className="input-field flex-1"
                  placeholder="사용할 닉네임을 입력하세요"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setMessage({ text: '', type: '' });
                  }}
                />
                <button type="button" className="btn btn-secondary ml-2" onClick={checkDuplicate}>
                  중복확인
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">2~12자 이내로 입력해주세요.</p>
            </div>

            <div className="policy-container">
              <div className="policy-title">
                <svg xmlns="http://www.w3.org/2000/svg" className="policy-icon h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                닉네임 생성 정책
              </div>
              <ul className="policy-list">
                <li>2~12자 이내의 한글, 영문, 숫자만 사용 가능합니다.</li>
                <li>욕설, 비속어, 성적인 표현이 포함된 닉네임은 사용할 수 없습니다.</li>
                <li>타인을 사칭하거나 혐오를 조장하는 닉네임은 제한됩니다.</li>
                <li>개인정보(전화번호, 주소 등)가 포함된 닉네임은 사용할 수 없습니다.</li>
                <li>운영정책에 위배되는 닉네임은 임의로 변경될 수 있습니다.</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary w-full">닉네임 설정 완료</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NicknamePopup;
