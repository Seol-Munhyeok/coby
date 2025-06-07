import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useNavigate } from 'react-router-dom';
import * as monaco from "monaco-editor";
import './BattleRoom.css';

export default function CodingBattle() {
  const editorRef = useRef(null);
  const opponentRefs = [useRef(null), useRef(null), useRef(null)];
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const colors = ["bg-red-500", "bg-yellow-500", "bg-purple-500"];
  const navigate = useNavigate();
  const nicknameRef = useRef(null);
  const answerRef = useRef(null);
  const languageRef = useRef(null)

  //서버에서 받아오는 로딩창 변수수
  const connectTimeRef = useRef(null);
  const startTimeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const defaultCode = `n = input()
lst = []

for i in range(len(n)):
    lst.append(int(n[i]))

lst.sort(reverse=True)
for num in range(len(n)):
    print(lst[num], end='')`;

  answerRef.value = defaultCode;
  nicknameRef.value = "python";
  const opponents = [
    `var twoSum = function(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
};`,
    `var twoSum = function(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
};`,
    `var twoSum = function(nums, target) {
  // 배열을 순회하면서 각 요소에 대해
  // 나머지 요소들과의 합이 target과 같은지 확인
};`,
  ];
  const handleSubmit = async () => {
    setIsLoading(true);
    setElapsedTime(0);
    startTimeRef.current = Date.now();

    // 경과 시간 업데이트 시작
    connectTimeRef.current = setInterval(() => {
      const elapsed = (Date.now() - (startTimeRef.current || 0)) / 1000;
      setElapsedTime(parseFloat(elapsed.toFixed(1)));
    }, 100);

    try {
      const response = await fetch("http://localhost:8080/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: answerRef.current?.value,
          language: nicknameRef.current?.value,
        }),
      });

      console.info(answerRef.current?.value, nicknameRef.current?.value);

      if (!response.ok) {
        throw new Error("서버 응답 실패");
      }

      const result = await response.json();
      console.log("서버 응답:", result);

      // 요청 성공 시
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setTimeout(() => {
        setIsLoading(false);
        alert("제출하였습니다.");
      }, 500);

    } catch (error) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setIsLoading(false);
      console.error("제출 중 오류:", error);
      alert("제출에 실패했습니다.");
    }
  };



  const handleGiveUp = async () => {
    alert('수고하셨습니다!');
    navigate("/resultpage");

  };

  

  useEffect(() => {
    let timeLeft = 15 * 60;
    const timerEl = timerRef.current;

    intervalRef.current = setInterval(() => {
      timeLeft--;
      const min = String(Math.floor(timeLeft / 60)).padStart(2, '0');
      const sec = String(timeLeft % 60).padStart(2, '0');
      if (timerEl) timerEl.textContent = `${min}:${sec}`;
      if (timeLeft <= 0) {
        clearInterval(intervalRef.current);
        alert("시간이 종료되었습니다!");
      }
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  // 언어 변경 핸들러
  const handleLanguageChange = () => {
    const lang = languageRef.current?.value;
    const editor = editorRef.current;

    if (editor && lang) {
      const model = editor.getModel();
      if (model) {
        // 언어를 변경합니다
        monaco.editor.setModelLanguage(model, lang === 'cpp' ? 'cpp' : lang);
      }
    }
  };



  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
      <header className="bg-slate-800 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <h1 className="text-xl font-bold">코딩 대결</h1>
        </div>
        <div ref={timerRef} className="BR-timer text-2xl font-bold text-orange-500">15:00</div>
        <div className="BR-player-card bg-slate-700 px-3 py-2 rounded">
          <div className="flex items-center">
            <div className="BR-player-avatar bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">나</div>
            <div className="ml-2 text-sm font-medium">코딩마스터</div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 flex gap-6">
        <section className="w-2/5 bg-slate-800 rounded-xl p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">문제: 두 수의 합</h2>
          <div className="bg-slate-700 p-4 rounded-lg mb-4">
            <p className="mb-3">정수 배열 <code className="bg-slate-800 px-1 rounded">nums</code>와 정수 <code className="bg-slate-800 px-1 rounded">target</code>이 주어졌을 때, <code className="bg-slate-800 px-1 rounded">nums</code>에서 두 수를 더해 <code className="bg-slate-800 px-1 rounded">target</code>이 되는 두 수의 인덱스를 반환하세요.</p>
            <h3 className="font-bold text-lg mb-2 mt-4">예시:</h3>
            <div className="bg-slate-800 p-3 rounded mb-3">
              <p>입력: nums = [2,7,11,15], target = 9</p>
              <p>출력: [0,1]</p>
              <p>설명: nums[0] + nums[1] == 9 이므로, [0, 1]을 반환합니다.</p>
            </div>
            <div className="bg-slate-800 p-3 rounded mb-3">
              <p>입력: nums = [3,2,4], target = 6</p>
              <p>출력: [1,2]</p>
            </div>
            <h3 className="font-bold text-lg mb-2">제약 조건:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>2 &lt;= nums.length &lt;= 10^4</li>
              <li>-10^9 &lt;= nums[i] &lt;= 10^9</li>
              <li>-10^9 &lt;= target &lt;= 10^9</li>
              <li>정확히 하나의 해만 존재합니다.</li>
            </ul>
          </div>
        </section>

        <section className="w-3/5 flex flex-col">
          <div className="mb-2 flex justify-between items-center">
            <h3 className="text-lg font-medium">코드 작성</h3>
            <select ref={languageRef} onChange={handleLanguageChange} className="bg-slate-700 text-white px-3 py-1 rounded text-sm">
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          <div className="flex-1 mb-4 h-[500px] rounded-lg overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="python"
              defaultValue={defaultCode}
              theme="vs-dark"
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              options={{
                fontSize: 14,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                roundedSelection: true,
                padding: { top: 10 },
              }}
            />
          </div>
          <div className="flex justify-end p-4 w-full gap-4">
            <button
              onClick={handleSubmit}
              className="bg-blue-500 hover:bg-blue-600 py-3 px-6 rounded-lg font-bold text-white self-end"
            >
              제출하기
            </button>
            <button
              onClick={handleGiveUp}
              className="bg-gray-500 hover:bg-blue-600 py-3 px-6 rounded-lg font-bold text-white self-end"
            >
              포기하기
            </button>
          </div>
        </section>
      </main>

      <section className="p-6">
        <h3 className="text-lg font-medium mb-3">다른 참가자 진행 상황</h3>
        <div className="grid grid-cols-3 gap-4">
          {opponentRefs.map((ref, i) => (
            <div key={i} className="bg-slate-800 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`BR-player-avatar ${colors[i]} text-white w-8 h-8 rounded-full flex items-center justify-center font-bold`}
                  >
                    {["상", "김", "박"][i]}
                  </div>
                  <div className="ml-2 text-sm font-medium">{["사용자1", "사용자2", "사용자3"][i]}</div>
                </div>
                <div className="text-xs text-gray-400">진행률: {i === 0 ? "45%" : i === 1 ? "60%" : "30%"}</div>
              </div>
              <div className="h-1 bg-slate-600 rounded-full mb-2">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: i === 0 ? "45%" : i === 1 ? "60%" : "30%" }}></div>
              </div>
              <div className="relative h-28 rounded-lg overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 p-2 text-sm text-white font-mono overflow-auto">
                  <pre>{opponents[i]}</pre>
                </div>
                <div className="absolute top-0 left-0 w-full h-full backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="bg-black/70 text-xs text-white px-4 py-1 rounded-full flex items-center gap-1">
                    <span className="flex gap-1">
                      <span className="w-1 h-1 bg-orange-400 rounded-full animate-bounce"></span>
                      <span className="w-1 h-1 bg-orange-400 rounded-full animate-bounce delay-200"></span>
                      <span className="w-1 h-1 bg-orange-400 rounded-full animate-bounce delay-400"></span>
                    </span>
                    코드 작성 중...
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {isLoading &&(
        <div id="loadingModal" className="fixed inset-0 flex items-center justify-center z-50">
          <div className="BR-modal-backdrop absolute inset-0 bg-black bg-opacity-50" />
          <div className="bg-gray-900 rounded-xl p-6 shadow-2xl z-10 w-64 border border-gray-800 relative flex flex-col items-center">
            {/* 로딩 스피너 */}
            <div className="relative w-16 h-16 mb-5 mt-2">
              {/* 외부 스피너 */}
              <svg className="BR-spinner absolute inset-0" viewBox="0 0 50 50">
                <circle cx={25} cy={25} r={20} fill="none" stroke="#3b82f6" strokeWidth={3} strokeLinecap="round" strokeDasharray="60 100" />
              </svg>
              {/* 내부 아이콘 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400 BR-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-gray-100 font-medium mb-3">처리 중...</h3>
            {/* 경과 시간 표시 */}
            <div className="flex items-center justify-center w-full text-sm text-gray-300 font-mono">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span id="elapsedTime">{elapsedTime.toFixed(1)}초</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
