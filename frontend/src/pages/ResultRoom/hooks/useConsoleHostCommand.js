/**
 * 콘솔에서 getHost() 명령어를 통해 호스트를 변경하는 로직을 담당하는 커스텀 훅입니다.
 */
import { useEffect } from 'react';

function useConsoleHostCommand(setRoomHost) {
  // useEffect(() => {
  //   window.getHost = () => {
  //     setRoomHost("코드마스터");
  //     console.log("코드마스터가 호스트가 되었습니다.");
  //   };

  //   return () => {
  //     delete window.getHost;
  //   };
  // }, [setRoomHost]);
}

export default useConsoleHostCommand;