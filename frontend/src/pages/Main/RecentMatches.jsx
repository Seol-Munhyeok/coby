import React from 'react';

// 최근 5경기에 대한 임시 데이터 수정 (문제 이름 추가)
const dummyMatches = [
  { id: 1, problemName: '문제1', result: '승리' },
  { id: 2, problemName: '문제2', result: '패배' },
  { id: 3, problemName: '문제3', result: '승리' },
  { id: 4, problemName: '문제4', result: '승리' },
  { id: 5, problemName: '문제5', result: '패배' },
];

function RecentMatches({ className }) {
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="text-lg font-bold text-gray-800">최근 대결</h3>
      </div>
      <div className="p-4 space-y-3">
        {dummyMatches.map((match) => (
          <div key={match.id} className={`flex items-center justify-between p-3 rounded-lg ${match.result === '승리' ? 'bg-blue-50' : 'bg-red-50'}`}>
            <span className="text-sm text-gray-800 font-medium truncate">{match.problemName}</span>
            <span className={`font-bold text-sm flex-shrink-0 ml-4 ${match.result === '승리' ? 'text-blue-600' : 'text-red-600'}`}>{match.result}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentMatches;