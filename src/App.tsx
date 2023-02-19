import { useState, useEffect, useRef } from 'react';

import "./style.css"

const ERROR_TIME_MS = 1000;
const DEFAULT_SESSION_TIME_MIN = 25;
const DEFAULT_BREAK_TIME_MIN = 5;

export const App = () => {
  const errorId = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [breakLength, setBreakLength] = useState<number>(DEFAULT_BREAK_TIME_MIN);
  const [sessionLength, setSessionLength] = useState<number>(DEFAULT_SESSION_TIME_MIN);
  const [timerLabel, setTimerLabel] = useState<string>("Session");
  const [timeLeft, setTimeLeft] = useState<number>(sessionLength * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (error) {
      if (errorId.current) {
        clearTimeout(errorId.current);
      }
      errorId.current = setTimeout(() => setError(false), 1000);
    }
  }, [error])

  useEffect(() => {
    let intervalId: number;
    if (isRunning) {
      if (timeLeft === 0) {
        audioRef.current?.play()
      }
      if (timeLeft >= 0) {
        intervalId = setInterval(() => {
          setTimeLeft(timeLeft - 1);
        }, 1000);
      } else {
        setTimerLabel(timerLabel === "Session" ? "Break" : "Session");
        setTimeLeft(timerLabel === "Session" ? breakLength * 60 : sessionLength * 60);
      }
      document.title = `[${timerLabel}] ${formatTime(timeLeft)}`
    }
    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft, breakLength, sessionLength, timerLabel]);

  const handleError = () => {
    setError(true);
    if (errorId.current) {
      clearTimeout(errorId.current);
    }
    errorId.current = setTimeout(() => setError(false), ERROR_TIME_MS);
  }

  const handleBreakUpdate = (diff: number) => {
    if (!isRunning) {
      if ((breakLength === 60 && diff > 0) || (breakLength === 1 && diff < 0)) {
        handleError();
        return;
      }
      const time = breakLength + diff;
      setBreakLength(time);
    }
  }

  const handleSessionUpdate = (diff: number) => {
    if (!isRunning) {
      if ((sessionLength === 60 && diff > 0) || (sessionLength === 1 && diff < 0)) {
        handleError();
        return;
      }
      const time = sessionLength + diff;
      setSessionLength(time);
      setTimeLeft(time * 60)
    }
  }

  const handleStartStop = () => {
    setIsRunning((_isRunning) => !_isRunning);
  };

  const handleReset = () => {
    document.title = "25 + 5 Clock";

    setIsRunning(false);
    setTimerLabel("Session");
    setTimeLeft(DEFAULT_SESSION_TIME_MIN * 60);
    setSessionLength(DEFAULT_SESSION_TIME_MIN);
    setBreakLength(DEFAULT_BREAK_TIME_MIN);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (time: number) => {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div id="main-container" className={error ? "error" : (timerLabel === "Session" ? "" : "break")}>
      <div id="pomodoro">
        <h1 id="timer-label">{error ? "ERROR" : timerLabel}</h1>
        <div id="time-left">{formatTime(timeLeft)}</div>

        <button id="start_stop" onClick={handleStartStop}>{isRunning ? "Stop" : "Start"}</button>
        <button id="reset" onClick={handleReset}>Reset</button>
        <audio id="beep" ref={audioRef} src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav" />

        <div id="configs">

          <div className="config">
            <h2 id="break-label">Break Length</h2>
            <div className="number-selector">
              <button id="break-decrement" disabled={isRunning} onClick={() => handleBreakUpdate(-1)}>-</button>
              <div id="break-length">{breakLength}</div>
              <button id="break-increment" disabled={isRunning} onClick={() => handleBreakUpdate(+1)}>+</button>
            </div>
          </div>

          <div className="config">
            <h2 id="session-label">Session Length</h2>
            <div className="number-selector">
              <button id="session-decrement" disabled={isRunning} onClick={() => handleSessionUpdate(-1)}>-</button>
              <div id="session-length">{sessionLength}</div>
              <button id="session-increment" disabled={isRunning} onClick={() => handleSessionUpdate(+1)}>+</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
