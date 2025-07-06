import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useNavigate } from 'react-router-dom';
import * as monaco from "monaco-editor";
import './BattleRoom.css';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import WarningModal from './WarningModal';
import FullscreenPromptModal from './FullscreenPromptModal'; // Import the new modal

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

  // State for the main battle timer
  const TOTAL_TIME_SECONDS = 15 * 60; // 15 minutes in seconds (your current setup)
  const DISPLAY_TOTAL_TIME_SECONDS = 60 * 60; // 1 hour for the display in the progress bar
  const [remainingTime, setRemainingTime] = useState(TOTAL_TIME_SECONDS);
  const [progressBarWidth, setProgressBarWidth] = useState(100);

  // Drawer state: 0: 완전히 닫힘, 1: 일부 열림, 2: 완전 열림
  const [drawerState, setDrawerState] = useState(0);

  // State for execution result block
  const [executionResult, setExecutionResult] = useState('여기에 실행 결과가 표시됩니다.');

  // 부정행위 감지 상태
  const [cheatingDetected, setCheatingDetected] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const MAX_WARNINGS = 3; // 최대 경고 횟수

  // Modal State for WarningModal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info'); // 'info', 'warning', 'error'

  // Modal State for FullscreenPromptModal
  const [isFullscreenPromptOpen, setIsFullscreenPromptOpen] = useState(false);


  const showModal = (title, message, type = 'info') => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalTitle('');
    setModalMessage('');
    setModalType('info');
  };

  const defaultCode = `n = input()
lst = []

for i in range(len(n)):
    lst.append(int(n[i]))

lst.sort(reverse=True)
for num in range(len(n)):
    print(lst[num], end='')`;

  answerRef.value = defaultCode; // This might cause issues if defaultCode is large, consider using useState for code.
  nicknameRef.value = "python"; // Same here, consider useState.
  const opponents = [
    {
        name: "사용자1",
        avatarInitial: "상",
        codeSnippet: `var twoSum = function(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
};`,
        progress: "45%",
        lineCount: 10 // Placeholder
    },
    {
        name: "사용자2",
        avatarInitial: "김",
        codeSnippet: `var twoSum = function(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
};`,
        progress: "60%",
        lineCount: 8 // Placeholder
    },
    {
        name: "사용자3",
        avatarInitial: "박",
        codeSnippet: `var twoSum = function(nums, target) {
  // 배열을 순회하면서 각 요소에 대해
  // 나머지 요소들과의 합이 target과 같은지 확인
};`,
        progress: "30%",
        lineCount: 5 // Placeholder
    },
  ];
  const handleSubmit = async () => {
    // 부정행위가 감지되면 제출을 막음
    if (cheatingDetected) {
      showModal("제출 실패", "부정행위가 감지되어 코드를 제출할 수 없습니다.", "error");
      return;
    }

    setIsLoading(true);
    setElapsedTime(0);
    startTimeRef.current = Date.now();
    setExecutionResult('코드 실행 중...'); // Update execution result on submission

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
          code: answerRef.value,
          language: nicknameRef.value,
        }),
      });

      console.info(answerRef.value, nicknameRef.value);

      if (!response.ok) {
        throw new Error("서버 응답 실패");
      }

      const result = await response.json();
      console.log("서버 응답:", result);

      // 요청 성공 시
      if (connectTimeRef.current) {
        clearInterval(connectTimeRef.current);
      }
      setTimeout(() => {
        setIsLoading(false);
        showModal("제출 완료", "코드가 성공적으로 제출되었습니다.", "info");
        setExecutionResult(result.output || '실행 결과가 없습니다.'); // Assuming 'result.output'
      }, 500);

    } catch (error) {
      if (connectTimeRef.current) {
        clearInterval(connectTimeRef.current);
      }
      setIsLoading(false);
      console.error("제출 중 오류:", error);
      showModal("제출 오류", '코드 실행 중 오류가 발생했습니다: ' + error.message, "error");
      setExecutionResult('코드 실행 중 오류가 발생했습니다: ' + error.message);
    }
  };



  const handleGiveUp = async () => {
    showModal("포기", '수고하셨습니다!', "info");
    // Add a slight delay before navigating to allow user to see the modal
    setTimeout(() => {
      navigate("/resultpage");
    }, 1500);
  };



  useEffect(() => {
    // This effect handles the main battle timer and progress bar
    intervalRef.current = setInterval(() => {
      setRemainingTime(prevTime => {
        if (prevTime <= 1) {
          clearInterval(intervalRef.current);
          showModal("시간 종료", "제한 시간이 종료되었습니다!", "info");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    // Update progress bar width based on remaining time and total time
    const newWidth = (remainingTime / TOTAL_TIME_SECONDS) * 100;
    setProgressBarWidth(newWidth);

    // Format remaining time for display
    const minutes = String(Math.floor(remainingTime / 60)).padStart(2, '0');
    const seconds = String(remainingTime % 60).padStart(2, '0');
    if (timerRef.current) {
      timerRef.current.textContent = `${minutes}:${seconds}`;
    }
  }, [remainingTime]);


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

  // Drawer state toggle function
  const handleDrawerToggle = () => {
    setDrawerState((prevState) => (prevState + 1) % 3); // Cycles 0 -> 1 -> 2 -> 0
  };


  // Dark mode toggle function
  const [isDarkMode, setIsDarkMode] = useState(true); // Dark mode state
  const toggleDarkMode = () => {
      setIsDarkMode(prevMode => !prevMode);
  };

  // Function to format time for display (e.g., 00:00:00 or 00:00)
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    } else {
      return `${pad(minutes)}:${pad(seconds)}`;
    }
  };

  // 전체 화면 요청 함수
  const requestFullScreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.warn("전체 화면 모드 요청 실패:", e);
        // 에러가 발생해도 FullscreenPromptModal은 닫히지 않도록 합니다.
      });
    } else {
      console.log("현재 브라우저는 전체 화면 모드를 지원하지 않습니다.");
      // 지원하지 않는 경우 사용자에게 알림을 줄 수도 있습니다.
      showModal("알림", "현재 브라우저는 전체 화면 모드를 지원하지 않습니다.", "info");
    }
  };

  // 전체 화면 상태 모니터링 및 Modal 띄우기
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        // 전체 화면 모드 진입 시 Modal 닫기
        setIsFullscreenPromptOpen(false);
      } else {
        // 전체 화면 모드 종료 시 Modal 다시 띄우기
        setIsFullscreenPromptOpen(true);
      }
    };

    // 컴포넌트 마운트 시 전체 화면이 아니라면 Modal 띄우기
    if (!document.fullscreenElement) {
      setIsFullscreenPromptOpen(true);
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // For Safari
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);   // For Firefox
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);     // For IE/Edge

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []); // 빈 의존성 배열로 컴포넌트 마운트/언마운트 시에만 실행


  // 부정행위 감지를 위한 useEffect
  useEffect(() => {

    const handleBlur = () => {
      // 현재 창에서 포커스가 없어졌을 때
      // Alt+Tab 등으로 다른 애플리케이션으로 이동하는 경우
      // document.hidden이 false일 때만 실행하여 중복 경고 방지
      if (!document.hidden) {
        setWarningCount(prevCount => {
          const newCount = prevCount + 1;
          if (newCount >= MAX_WARNINGS) {
            setCheatingDetected(true);
            showModal("부정행위 감지", "부정행위가 3회 이상 감지되어 더 이상 코드를 제출할 수 없습니다.", "error");
          } else {
            showModal("경고!", `화면 이탈이 감지되었습니다. ${MAX_WARNINGS - newCount}회 더 이탈 시 부정행위로 간주됩니다.`, "warning");
          }
          return newCount;
        });
      }
    };

    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [warningCount, cheatingDetected]); // warningCount와 cheatingDetected를 의존성 배열에 추가

  
// 클립보드 초기화 (페이지 로드 시 1회만 실행)
  useEffect(() => {
    async function clearClipboardOnLoad() {
      try {
        await navigator.clipboard.writeText('');
        console.log('클립보드 내용이 페이지 로드 시 1회 삭제되었습니다.');
      } catch (err) {
        console.error('클립보드 삭제 실패 (페이지 로드 시):', err);
      }
    }
    clearClipboardOnLoad();
  }, []); // 빈 배열은 컴포넌트 마운트 시 1회만 실행되도록 합니다.



  return (
    <div className={`min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans ${isDarkMode ? '' : 'light-mode'}`}  onContextMenu={(e) => e.preventDefault()}>
      <header className="bg-slate-800 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <h1 className="text-xl font-bold">COBY</h1>
        </div>
        {/* Updated Timer Display */}
        <div className="BR-timer-container flex flex-col items-center">
            <div className="BR-progress-bar-wrapper w-64 bg-slate-600 rounded-full h-2 overflow-hidden">
                <div
                    className="BR-progress-bar bg-green-500 h-full rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${progressBarWidth}%` }}
                ></div>
            </div>
            <div className="flex justify-between w-64 text-sm mt-1">
                <span ref={timerRef} className="BR-countdown-time text-orange-400 font-bold">{formatTime(remainingTime)}</span>
                <span className="BR-total-time text-slate-400">제한시간: {formatTime(DISPLAY_TOTAL_TIME_SECONDS)}</span>
            </div>
        </div>

        <div className="BR-player-card bg-slate-700 px-3 py-2 rounded flex space-x-6">
          <select ref={languageRef} onChange={handleLanguageChange} className="bg-slate-700 text-white px-3 py-1 rounded text-sm">
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>

          <button onClick={toggleDarkMode} className="waitingRoom-text hover:text-blue-100 transition">
              {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>

              ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h1M3 12h1m15.325-4.707l-.707-.707M6.707 6.707l-.707-.707m1.414 14.14L4.929 19.071m14.14-1.414l-.707-.707M12 18a6 6 0 110-12 6 6 0 010 12z" />
                  </svg>
              )}
          </button>
          
          <div className="flex items-center">
            <div className="BR-player-avatar bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">나</div>
            <div className="ml-2 text-sm font-medium">코딩마스터</div>
          </div>
        </div>
      </header>

      {/* Main content area including the drawer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Drawer */}
        <div className={`drawer bg-slate-800 p-4 flex flex-col ${
            drawerState === 0 ? 'drawer-fully-closed' :
            drawerState === 1 ? 'drawer-partially-open' :
            'drawer-fully-open'
        }`}>
          <div className="flex items-center justify-between mb-3">
            {drawerState !== 0 && ( // Only show header if not fully closed
              <h3 className="text-lg font-medium">
                {drawerState === 2 ? "참가자 진행 상황" : "참가자"}
              </h3>
            )}
            <button onClick={handleDrawerToggle} className="text-slate-400 hover:text-blue-400 transition-colors">
              {drawerState === 0 ? (
                // Open icon (e.g., right arrow or hamburger) for fully closed state
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                // Close icon (e.g., left arrow or X) for partially/fully open states
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
              )}
            </button>
          </div>
          {drawerState !== 0 && ( // Only show opponent list if not fully closed
            <div className="flex-1 overflow-y-auto">
              {opponents.map((opponent, i) => (
                <div key={i} className="mb-4 bg-slate-700 p-3 rounded-lg flex flex-col">
                  {/* Always visible part (collapsed & expanded) */}
                  <div className="flex items-center justify-between">
                    {/* Updated structure for Avatar and Name */}
                    <div className="flex flex-col items-center">
                      <div className={`BR-player-avatar ${colors[i]} text-white w-8 h-8 rounded-full flex items-center justify-center font-bold`}
                      >
                        {opponent.avatarInitial}
                      </div>
                      <div className="mt-1 text-sm font-medium">{opponent.name}</div>
                    </div>
                    {/* Show line count when partially open */}
                    {drawerState === 1 && (
                      <div className="text-xs text-gray-400">
                        {opponent.lineCount} <span className="text-gray-500">line</span>
                      </div>
                    )}
                  </div>

                  {/* Visible only when drawer is fully open */}
                  {drawerState === 2 && (
                    <>
                      <div className="text-xs text-gray-400 mt-2">진행률: {opponent.progress}</div>
                      <div className="h-1 bg-slate-600 rounded-full mt-1 mb-2">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: opponent.progress }}></div>
                      </div>
                      <div className="relative h-28 rounded-lg overflow-hidden opponent-screen-preview">
                        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 p-2 text-sm text-white font-mono overflow-auto">
                          <pre>{opponent.codeSnippet}</pre>
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
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Main content area (Problem + Editor + Result) */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
            <PanelGroup direction="horizontal" className="flex-1 w-full">
              {/* Problem Section (Left Panel) */}
              <Panel defaultSize={40} minSize={20} className="bg-slate-800 rounded-xl p-6 overflow-y-auto">
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
              </Panel>

              {/* Resizer between Problem and Editor/Result */}
              <PanelResizeHandle className="resize-handle" />

              {/* Right Side: Editor and Execution Result (Nested Vertical PanelGroup) */}
              <Panel defaultSize={60} minSize={20} className="flex flex-col h-full">
                <PanelGroup direction="vertical" className="flex-1 w-full">

                  {/* Code Editor Section (Top-Right Panel) */}
                  <Panel defaultSize={70} minSize={20} className="flex flex-col">
                    <div className="flex-1 h-full rounded-lg overflow-hidden">
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
                    {/* The buttons div below the editor is removed as requested */}
                  </Panel>

                  {/* Resizer between Editor and Execution Result */}
                  <PanelResizeHandle className="horizontal-resize-handle" /> {/* CHANGED CLASS HERE */}

                  {/* Execution Result Section (Bottom-Right Panel) */}
                  <Panel defaultSize={30} minSize={10} className="bg-slate-800 rounded-xl p-4 flex flex-col"> {/* Added flex flex-col */}
                    <div className="flex items-center justify-between mb-2"> {/* New flex container for title and button */}
                      <h3 className="text-xl font-bold">실행 결과</h3> {/* Removed mb-2 here, moved to parent div */}
                      <div className="flex">
                        <button
                        onClick={handleSubmit}
                        className="bg-green-600 hover:bg-green-700 py-2 px-4 rounded-lg font-bold text-white flex items-center gap-2 text-base"
                        disabled={cheatingDetected} // 부정행위 감지 시 버튼 비활성화
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.027A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        실행
                      </button>

                      <button
                        onClick={handleGiveUp}
                        className="bg-grey-600 hover:bg-grey-700 py-2 px-4 rounded-lg font-bold text-white flex items-center gap-2 text-base"
                        disabled={cheatingDetected} // 부정행위 감지 시 버튼 비활성화
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.027A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        포기
                      </button>

                      </div>
                      
                    </div>
                    <pre className="bg-slate-700 p-3 rounded text-sm text-slate-200 whitespace-pre-wrap flex-1 overflow-y-auto">
                      {executionResult}
                    </pre>
                    {cheatingDetected && (
                        <div className="mt-4 p-3 bg-red-600 rounded-lg text-white font-bold text-center">
                            부정행위가 감지되었습니다. 더 이상 코드를 제출할 수 없습니다.
                        </div>
                    )}
                  </Panel>

                </PanelGroup>
              </Panel>
            </PanelGroup>
          </div>
        </div>


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

      <WarningModal
        isOpen={isModalOpen}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={closeModal}
      />

      <FullscreenPromptModal
          isOpen={isFullscreenPromptOpen}
          onClose={() => setIsFullscreenPromptOpen(false)}
          onEnterFullscreen={requestFullScreen}
        />
    </div>
  );
}