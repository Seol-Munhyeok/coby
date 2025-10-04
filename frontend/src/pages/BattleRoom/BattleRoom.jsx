import React, { useEffect, useRef, useState ,useCallback } from "react";
import Editor from "@monaco-editor/react";
import { useNavigate, useParams } from 'react-router-dom';
import * as monaco from "monaco-editor";
import './BattleRoom.css';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import WarningModal from './WarningModal';
import FullscreenPromptModal from './FullscreenPromptModal';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useAuth } from '../AuthContext/AuthContext';
import {number} from "sockjs-client/lib/utils/random";


export default function CodingBattle() {
    const { roomId } = useParams();
    const editorRef = useRef(null);
    //const opponentRefs = [useRef(null), useRef(null), useRef(null)];

    const timerIdRef = useRef(null); // setTimeout/setInterval ID를 위한 ref (숫자 저장)
    const domTimerRef = useRef(null); // DOM 요소 (타이머 표시 span)를 위한 ref (DOM 요소 참조 저장)

    const intervalRef = useRef(null);
    const colors = ["bg-red-500", "bg-yellow-500", "bg-purple-500"];
    const navigate = useNavigate();
    //const nicknameRef = useRef(null);
    const answerRef = useRef(null);
    const languageRef = useRef(null);
    const [myUserId, setMyUserId] = useState('');

    const [currentLanguage, setCurrentLanguage] = useState('python');
    // 서버에서 받아오는 로딩창 변수
    const connectTimeRef = useRef(null);
    const startTimeRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isFeverTime, setIsFeverTime] = useState(false);
    // State for the main battle timer
    const [totalTimeSeconds, setTotalTimeSeconds] = useState(null);
    const [remainingTime, setRemainingTime] = useState(null);
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


    // WebSocket 연결을 위한 ref
    //const wsRef = useRef(null);
    const stompClientRef = useRef(null);

    // AuthContext에서 user 정보 가져오기
    const { user } = useAuth();
    const userNickname = user?.nickname || '게스트';
    const userId = user?.id || 99
    const userPreferredLanguage = user?.preferredLanguage || 'python';


    useEffect(() => {
        // useRef 값 초기화 (DOM이 마운트된 후에 접근)
        if (languageRef.current) {
            // 사용자의 선호 언어로 초기값을 설정합니다.
            languageRef.current.value = userPreferredLanguage;
        }
    }, [userPreferredLanguage]); // userPreferredLanguage가 변경될 때도 이 효과가 다시 실행됩니다.


    console.log("id =" + userId)


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

    const defaultCode = `# Coby 게임에 오신 것을 환영합니다!
# 다른 AI의 도움을 받지 않고 정정당당하게 승리하세요.
# (Ctrl + C, Ctrl + V는 불가합니다.)
# 화이팅! 💪✨🔥`;

    answerRef.value = defaultCode; // This might cause issues if defaultCode is large, consider using useState for code.
   //nicknameRef.value = "python"; // Same here, consider useState.
    // ADDITIONS: API를 통해 불러온 문제 데이터를 저장할 상태 변수
    const [problem, setProblem] = useState(null);
    const [isLoadingProblem, setIsLoadingProblem] = useState(true);
    // 상대방 정보는 더미 데이터로 시작하며, 실제로는 서버에서 받아와야 합니다.
    const [opponents, setOpponents] = useState([]);
    const [problemId, setProblemId] = useState(null);

    const pollSubmissionResult = async (submissionId) => {
        let intervalId;

        return new Promise((resolve, reject) => {
            intervalId = setInterval(async () => {
                try{
                    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/submissions/${submissionId}`, {
                        method: "GET",
                        credentials: 'include'
                    });

                    if (!res.ok){
                        clearInterval(intervalId);
                        throw new Error("조회 실패");
                    }
                    const data = await res.json();

                    if(data.result !== "Pending"){
                        clearInterval(intervalId);
                        console.log("Pending 외의 상태 수신: ",data.status, data.details)
                        resolve(data);
                    }
                } catch(err) {
                    clearInterval(intervalId);
                    reject(err);
                }
            },3000);
        });
    };

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handleSubmit = async () => {
        // 부정행위가 감지되면 제출을 막음
        if (cheatingDetected) {
            showModal("제출 실패", "부정행위가 감지되어 코드를 제출할 수 없습니다.", "error");
            return;
        }

        setIsLoading(true);
        setElapsedTime(0);
        startTimeRef.current = Date.now();
        setExecutionResult('코드 실행 중...');

        // 타이머 변수를 선언
        let timerInterval = null;

        // 경과 시간 업데이트 시작
        timerInterval = setInterval(() => {
            const elapsed = (Date.now() - (startTimeRef.current || 0)) / 1000;
            setElapsedTime(parseFloat(elapsed.toFixed(1)));
        }, 100);

        try {
            if (!userId || !roomId || !problemId) {
                showModal("제출 오류", "필수 정보(userId, roomId, problemId)가 누락되었습니다.", "error");
                setIsLoading(false);
                return;
            }

            const submissionData = {
                userId: parseInt(userId, 10),
                problemId: problemId,
                roomId: parseInt(roomId, 10),
                language: languageRef.current.value,
                sourceCode: editorRef.current.getValue(),
            };

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/submissions`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submissionData),
            });

            if (!response.ok) {
                throw new Error("서버 응답 실패");
            }
            const accept = await response.json();

            // 불필요한 delay(15000)를 제거하고
            // pollSubmissionResult 함수가 끝날 때까지 기다립니다.
            const result = await pollSubmissionResult(accept.submissionId);

            setIsLoading(false);
            showModal(
                "제출 완료",
                <>
                    코드가 성공적으로 제출되었습니다.<br />
                    결과: {result.result || '정보 없음'}<br />
                    평균 실행 시간: {result.avg_time || '정보 없음'} 초<br />
                    평균 메모리 사용: {result.avg_memory || '정보 없음'} MB
                </>,
                "info"
            );
            setExecutionResult(
                <>
                    {result.details}
                </>,
                "info");

        } catch (error) {
            setIsLoading(false);
            console.error("제출 중 오류:", error);
            showModal("제출 오류", "코드 실행 중 오류가 발생했습니다: " + error.message, "error");
            setExecutionResult("코드 실행 중 오류가 발생했습니다: " + error.message);
        } finally {
            // 성공하든 실패하든 여기서 타이머를 멈춥니다.
            if (timerInterval) clearInterval(timerInterval);
        }
    };

    const handleGiveUp = async () => {
        showModal("포기", '수고하셨습니다!', "info");
        // Add a slight delay before navigating to allow user to see the modal
        setTimeout(() => {
            navigate(`/resultpage/${roomId}`);
        }, 1500);
    };
    useEffect(() => {
        const fetchProblem = async () => {
            setIsLoadingProblem(true);
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/rooms/${roomId}/problem`);

                if (!response.ok) {
                    const errorMessage = `HTTP 오류: ${response.status} ${response.statusText}`;
                    throw new Error(errorMessage);
                }

                const data = await response.json();
                setProblem(data);
                setProblemId(data.id);
            } catch (error) {
                console.error("문제 불러오기 오류:", error);
                showModal("오류", `문제 정보를 불러오는 중 오류가 발생했습니다: ${error.message}`, "error");
            } finally {
                setIsLoadingProblem(false);
            }
        };

        // fetchRoomDetails() 대신 fetchProblem() 함수를 직접 호출하도록 수정
        fetchProblem();

    }, [roomId]);
    // Main battle timer useEffect
    useEffect(() => {
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

    // Progress bar and time display useEffect (domTimerRef 사용으로 수정)
    useEffect(() => {
        if (totalTimeSeconds === null || remainingTime === null) return; // 초기값이 null일 때 실행 방지
        const newWidth = (remainingTime / totalTimeSeconds) * 100;
        setProgressBarWidth(newWidth);

        const minutes = String(Math.floor(remainingTime / 60)).padStart(2, '0');
        const seconds = String(remainingTime % 60).padStart(2, '0');

        // domTimerRef.current가 유효한 DOM 요소를 참조하는지 확인
        if (domTimerRef.current) {
            domTimerRef.current.textContent = `${minutes}:${seconds}`;

        }
    }, [remainingTime, totalTimeSeconds]);

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


    // Function to format time for display (e.g., 00:00:00 or 00:00)
    const formatTime = (totalSeconds) => {
        if (totalSeconds === null) return "00:00"; // 초기값 null 처리
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


    // WebSocket 초기화 및 이벤트 핸들링
    useEffect(() => {
        const socketFactory = () => new SockJS(`${process.env.REACT_APP_API_URL}/ws/vs`);

        // **로그인한 사용자 ID 사용 (없으면 타임스탬프 기반 ID 생성)**
        // 서버는 숫자 형태의 userId만 허용하므로 문자열로 변환
        const generatedUserId = userId ? String(userId) : Date.now().toString();
        setMyUserId(generatedUserId); // ID를 상태에 저장

        const client = new Client({
            webSocketFactory: socketFactory,
            debug: (str) => {
                console.log(new Date(), str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log('STOMP 연결 성공:', frame);

            client.publish({
                destination: '/app/join_room',
                body: JSON.stringify({
                    type: "join_room",
                    roomId: roomId,
                    userId: generatedUserId, // <-- 생성된 ID 사용
                    userNickname: userNickname
                })
            });

            client.subscribe(`/topic/room/${roomId}`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                console.log('서버로부터 메시지 수신:', receivedMessage);

                if (receivedMessage.type === "code_update") {
                    // 내 코드는 내가 입력하므로, 상대방의 코드 업데이트만 처리
                    if (receivedMessage.userId !== generatedUserId) {
                        setOpponents(prevOpponents => {
                            const existingOpponent = prevOpponents.find(op => op.id === receivedMessage.userId);
                            if (existingOpponent) {
                                // 기존 상대방 업데이트
                                const updatedOpponents = prevOpponents.map(op => {
                                    if (op.id === receivedMessage.userId) {
                                        return {
                                            ...op,
                                            lineCount: receivedMessage.lineCount || op.lineCount,
                                            // code: receivedMessage.code, // 상대방 에디터 동기화 시 필요
                                        };
                                    }
                                    return op;
                                });
                                console.log("Updated Opponents after code_update:", updatedOpponents);
                                return updatedOpponents;
                            } else {
                                // 새로운 상대방이 방에 들어와서 코드를 업데이트한 경우 추가
                                const newOpponent = {
                                    id: receivedMessage.userId,
                                    name: receivedMessage.userNickname || receivedMessage.userId,
                                    avatarInitial: receivedMessage.userId.charAt(0).toUpperCase(),
                                    progress: "0%",
                                    lineCount: receivedMessage.lineCount || 0,
                                    // code: receivedMessage.code,
                                };
                                const newOpponents = [...prevOpponents, newOpponent];
                                console.log("New Opponent added:", newOpponents);
                                return newOpponents;
                            }
                        });
                    }
                } else if (receivedMessage.type === "submission_result") {
                    console.log(`User ${receivedMessage.userId} submitted: ${receivedMessage.passedTests}/${receivedMessage.totalTests} tests passed.`);
                    setIsLoading(false); // 제출 결과 받았으므로 로딩 해제

                    if (receivedMessage.userId === generatedUserId) {
                        // 내 제출 결과
                        setExecutionResult(`제출 결과: ${receivedMessage.passedTests} / ${receivedMessage.totalTests} 테스트 통과.`);
                        showModal("제출 완료", `코드가 성공적으로 제출되었습니다. ${receivedMessage.passedTests} / ${receivedMessage.totalTests} 테스트 통과.`, "info");
                    } else {
                        // 상대방 제출 결과
                        setOpponents(prevOpponents => {
                            const updatedOpponents = prevOpponents.map(op => {
                                if (op.id === receivedMessage.userId) {
                                    const newProgress = (receivedMessage.passedTests / receivedMessage.totalTests) * 100;
                                    return {
                                        ...op,
                                        progress: `${newProgress.toFixed(0)}%`
                                    };
                                }
                                return op;
                            });
                            console.log("Updated Opponents after submission_result:", updatedOpponents);
                            return updatedOpponents;
                        });
                    }
                } else if (receivedMessage.type === "room_participants") {
                    // 서버에서 보낸 초기 참여자 정보로 opponents 상태 초기화
                    // 이때 자신은 opponents 목록에서 제외합니다.
                    const newParticipants = receivedMessage.participants
                        .filter(p => p.userId !== generatedUserId)
                        .slice(0, 3) // 최대 3명으로 제한
                        .map(p => ({
                            id: p.userId,
                            name: p.userNickname || `User ${p.userId.substring(p.userId.length - 4)}`,
                            avatarInitial: p.userName ? p.userName.charAt(0).toUpperCase() : '?',
                            progress: `${(p.progress || 0).toFixed(0)}%`,
                            lineCount: p.lineCount || 0
                        }));
                    // **이 부분이 핵심입니다: prevOpponents를 사용하지 않고, newParticipants로 완전히 교체**
                    setOpponents(newParticipants);
                    console.log("Opponents state initialized/updated from room_participants:", newParticipants);
                }
            });

            // 승자 발생 메시지 구독
            client.subscribe(`/topic/room/${roomId}/result`, (message) => {
                const winnerMessage = JSON.parse(message.body);
                console.log('🎉 승자 정보 수신:', winnerMessage);

                // 승자 정보를 담아 모달을 띄웁니다.
                showModal(
                    "게임 종료!",
                    `축하합니다! ${winnerMessage.nickname}님이 승리했습니다! 잠시 후 결과 페이지로 이동합니다.`,
                    "info"
                );

                // 3초 후 결과 페이지로 이동
                setTimeout(() => {
                    navigate(`/resultpage/${roomId}`, {
                        state: {
                            winnerSubmissionId: winnerMessage.submissionId
                        }
                    });
                }, 3000);
            });
        };

        client.onStompError = (frame) => {
            console.error('STOMP 오류:', frame);
            showModal("연결 오류", "STOMP 프로토콜 오류가 발생했습니다. 개발자 도구를 확인해주세요.", "error");
        };

        client.onWebSocketClose = (event) => {
            console.log('웹소켓 연결 종료됨:', event);
        };

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.deactivate();
                console.log("STOMP 연결 해제됨");
            }
        };
    }, [userId, roomId, userNickname, navigate]); // roomId, userNickname, navigate를 의존성 배열에 추가

    // Monaco Editor 내용 변경 시 서버로 업데이트 전송 (timerIdRef 사용으로 수정)
    const handleEditorChange = useCallback((value) => {

        if (timerIdRef.current) clearTimeout(timerIdRef.current);

        timerIdRef.current = setTimeout(() => {
            if (stompClientRef.current && stompClientRef.current.connected && myUserId) {
                const currentLineCount = value ? value.split('\n').length : 0;
                setIsFeverTime(currentLineCount>= 15);
                stompClientRef.current.publish({
                    destination: '/app/code_update',
                    headers: {},
                    body: JSON.stringify({
                        type: "code_update",
                        roomId: roomId,
                        userId: myUserId,
                        lineCount: currentLineCount,
                        userNickname : userNickname,
                        code: value, // 다른 클라이언트에 코드 내용을 보내 동기화할 수 있도록 포함
                    }),
                });
            } else {
                console.warn("STOMP 클라이언트가 연결되지 않았거나 사용자 ID가 설정되지 않아 코드 업데이트 메시지를 보낼 수 없습니다.");
            }
        }, 500); // 500ms 디바운스
    }, [myUserId, roomId, userNickname]); // roomId와 userNickname도 의존성 배열에 추가

    // Monaco Editor 마운트 시 붙여넣기 방지 이벤트 리스너 추가
    const handleEditorDidMount = useCallback((editor, monacoInstance) => {
        editorRef.current = editor;
        /*
        editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyV, () => {
            showModal("경고", "코드 에디터에 붙여넣기 기능을 사용할 수 없습니다. (Monaco Command Block)", "warning");
        });
        */
        editor.getContainerDomNode().addEventListener('paste', (event) => {
            console.log('Monaco Editor 컨테이너에서 paste 이벤트 감지');
            event.preventDefault();
            event.stopPropagation();

            showModal("경고", "코드 에디터에 붙여넣기 기능을 사용할 수 없습니다.", "warning");
        }, true);
    }, []);


    //roomId로 방의 정보를 가져오는 코드
    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                const apiUrl = `${process.env.REACT_APP_API_URL}/api/rooms/${roomId}`;
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('✅ API 응답 데이터:', data);

                // 응답 데이터에 timeLimit 값이 문자열로 있는지 확인합니다.("30분"의 string으로 반환되기 때문)
                if (data && typeof data.timeLimit === 'string') {
                    // parseInt를 사용해 문자열의 시작 부분에서 숫자만 추출합니다. (예: "30분" -> 30)
                    const extractedTime = parseInt(data.timeLimit, 10);

                    // 성공적으로 숫자를 추출했다면(NaN이 아니라면) 60(초)를 곱하여 상태를 업데이트합니다.
                    if (!isNaN(extractedTime)) {
                        setTotalTimeSeconds(extractedTime * 60);
                        setRemainingTime(extractedTime * 60)
                    } else {
                        console.warn(`⚠️ timeLimit 값('${data.timeLimit}')에서 숫자를 추출할 수 없습니다.`);
                    }
                    } else {

                    console.warn('⚠️ 응답 데이터에 유효한 timeLimit 값이 없습니다.');
                }

            } catch (error) {
                console.error('❌ 데이터를 가져오는 중 오류 발생:', error);
            }
        };

        fetchRoomData();

    }, [roomId]);


    return (
        <div className={`min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans`}  onContextMenu={(e) => e.preventDefault()}>
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
                        {/* domTimerRef를 span 요소에 연결 */}
                        <span ref={domTimerRef} className="BR-countdown-time text-orange-400 font-bold">{formatTime(remainingTime)}</span>
                        <span className="BR-total-time text-slate-400">제한시간: {formatTime(totalTimeSeconds)}</span>
                    </div>
                </div>

                <div className="BR-player-card bg-slate-700 px-3 py-2 rounded flex space-x-6">
                    <select ref={languageRef} onChange={handleLanguageChange} className="bg-slate-700 text-white px-3 py-1 rounded text-sm">
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>

                    <div className="flex items-center">
                        <div className={`BR-player-avatar bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold ${isFeverTime ? 'fever-time' : ''}`}>나</div>
                        <div className="ml-2 text-sm font-medium">{userNickname}</div>
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
                            {opponents.map((opponent, i) => {
                                const isOpponentProgressActive = opponent.lineCount > 15;
                                return (
                                    <div key={opponent.id} className="mb-4 bg-slate-700 p-3 rounded-lg flex flex-col">
                                        {/* Always visible part (collapsed & expanded) */}
                                        <div className="flex items-center justify-between">
                                            {/* Updated structure for Avatar and Name */}
                                            <div className="flex flex-col items-center">
                                                <div className={`BR-player-avatar ${colors[i % colors.length]} text-white w-8 h-8 rounded-full flex items-center justify-center font-bold ${isOpponentProgressActive ? 'opponent-progress-active' : ''}`}
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
                                                        {/* opponent.codeSnippet 대신 가상의 코드 블록 생성 */}
                                                        <pre>
                              {Array(opponent.lineCount).fill('// Some code line;').join('\n')}
                          </pre>
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
                                );
                            })}
                        </div>
                    )}
                </div>


                {/* Main content area (Problem + Editor + Result) */}
                <div className="flex-1 flex flex-col p-6 overflow-hidden">
                    <PanelGroup direction="horizontal" className="flex-1 w-full">
                        {/* Problem Section (Left Panel) */}
                        <Panel defaultSize={40} minSize={20} className="bg-slate-800 rounded-xl p-6 overflow-y-auto">
                            {/* 로딩 상태와 데이터 존재 여부에 따라 조건부 렌더링 */}
                            {isLoadingProblem ? (
                                <p className="text-center text-lg animate-pulse">문제를 불러오는 중...</p>
                            ) : problem ? (
                                <>
                                    {/* 문제 제목을 동적으로 표시 */}
                                    <h2 className="text-2xl font-bold mb-4">{problem.title}</h2>
                                    <div className="bg-slate-700 p-4 rounded-lg mb-4">
                                        {/* content 필드의 줄바꿈을 그대로 적용하여 표시 */}
                                        <p className="whitespace-pre-wrap">{problem.content}</p>
                                    </div>
                                </>
                            ) : (
                                <p className="text-center text-red-400 text-lg">문제를 불러올 수 없습니다. 방 번호를 확인해주세요.</p>
                            )}
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
                                            defaultLanguage={userPreferredLanguage}
                                            defaultValue={defaultCode}
                                            theme="vs-dark"
                                            onMount={handleEditorDidMount} // onMount 핸들러 연결
                                            onChange={handleEditorChange} // 에디터 내용 변경 시 이벤트 핸들러 연결
                                            options={{
                                                fontSize: 14,
                                                minimap: { enabled: true },
                                                scrollBeyondLastLine: false,
                                                roundedSelection: true,
                                                padding: { top: 10 },
                                                contextmenu: false, // 마우스 오른쪽 클릭 컨텍스트 메뉴 비활성화
                                            }}
                                        />
                                    </div>
                                </Panel>

                                {/* Resizer between Editor and Execution Result */}
                                <PanelResizeHandle className="horizontal-resize-handle" />

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
                                                결과화면 이동하기
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