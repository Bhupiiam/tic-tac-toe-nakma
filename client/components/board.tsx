'use client';
import { useState, useEffect, useRef } from 'react';
import Square from './square';
import { MatchData } from '@heroiclabs/nakama-js';
import Nakama from '@/lib/nakama';
import {
  OpCode,
  StartMessage,
  DoneMessage,
  UpdateMessage,
} from '@/lib/messages';

import { Button } from '@/components/ui/button';

export default function Game() {
  const [squares, setSquares] = useState<(number | null)[]>(
    Array(9).fill(null)
  );
  const [playerIndex, setPlayerIndex] = useState<number>(-1);
  const [playerTurn, setPlayerTurn] = useState<number>(-1);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [gameMessage, setMessage] = useState<string>('Welcome to XOXO');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const nakamaRef = useRef<Nakama | undefined>(undefined);

  function initSocket() {
    if (
      !nakamaRef.current ||
      !nakamaRef.current.socket ||
      !nakamaRef.current.session
    )
      return;
    const userId = nakamaRef.current.session.user_id;

    let socket = nakamaRef.current.socket;

    socket.onmatchdata = (matchState: MatchData) => {
      if (!nakamaRef.current) return;
      const json_string = new TextDecoder().decode(matchState.data);
      const json: string = json_string ? JSON.parse(json_string) : '';
      console.log('op_code: ', matchState.op_code);

      let myPlayerIndex = nakamaRef.current.gameState.playerIndex;

      if (typeof json === 'object' && json !== null) {
        switch (matchState.op_code) {
          case OpCode.START:
            const startMessage = json as StartMessage;
            setTimeLeft(0);
            setSquares(startMessage.board);
            setPlayerTurn(startMessage.mark);
            setGameStarted(true);
            setGameOver(false);
            setMessage('Game Started!');

            let tmpId = startMessage.marks[userId!];
            if (tmpId !== null) {
              setPlayerIndex(tmpId);
              nakamaRef.current.gameState.playerIndex = tmpId;
            } else {
              console.error('tmpId is null');
            }
            break;
          case OpCode.UPDATE:
            const updateMessage = json as UpdateMessage;
            if (updateMessage.mark === myPlayerIndex) {
              setMessage('Your Turn!');
            }
            setPlayerTurn(updateMessage.mark);
            setSquares(updateMessage.board);
            setDeadline(updateMessage.deadline);
            break;
          case OpCode.DONE:
            const doneMessage = json as DoneMessage;
            setDeadline(doneMessage.nextGameStart);
            setGameStarted(false);
            setGameOver(true);
            setSquares(doneMessage.board);
            setPlayerTurn(-1);
            if (doneMessage.winner === myPlayerIndex) {
              setMessage('You won!');
            } else {
              setMessage('You lost!');
            }
            break;
          case OpCode.MOVE:
            // Handle MOVE message
            break;
          case OpCode.REJECTED:
            // Handle REJECTED message
            break;
          default:
            // Handle unknown message
            break;
        }
      }
    };
  }

  useEffect(() => {
    const initNakama = async () => {
      nakamaRef.current = new Nakama();
      await nakamaRef.current.authenticate();
      initSocket();
    };
    initNakama();
  }, []);

  useEffect(() => {
    if (deadline !== null) {
      const intervalId = setInterval(() => {
        setTimeLeft(deadline * 1000 - Date.now());
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [deadline]);

  function handleClick(i: number) {
    if (!gameStarted) {
      setMessage("Game hasn't started yet!");
      return;
    }
    if (!nakamaRef.current) return;

    if (playerTurn === playerIndex && squares[i] === null) {
      const nextSquares = squares.slice();

      nextSquares[i] = playerIndex;
      setSquares(nextSquares);
      nakamaRef.current.makeMove(i);
      setMessage("Wait for other player's turn!");
    } else if (playerTurn !== playerIndex) {
      setMessage("It's not your turn!");
    }
  }

  async function findMatch() {
    if (!nakamaRef.current) return;
    await nakamaRef.current.findMatch();
    if (nakamaRef.current.matchId === null) {
      setMessage('Server Error:Failed to find match!');
    }
    console.log('find match, matchId: ', nakamaRef.current.matchId!);
    setMessage('Waiting for another player to join...');
  }

  function playAgain() {
    setGameOver(false);
    setMessage('Welcome to XOXO');
    findMatch();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="mb-4 text-2xl font-bold">{gameMessage}</div>
      {!gameStarted && !gameOver && (
        <Button onClick={findMatch} size="lg">
          Find Match
        </Button>
      )}
      {gameOver && (
        <Button onClick={playAgain} size="lg">
          Play Again
        </Button>
      )}
      {gameStarted && (
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="rounded-lg bg-gray-700 px-4 py-2 text-xl font-medium text-white">
            You are{' '}
            <span
              className={`${
                playerIndex === 0 ? 'text-blue-400' : 'text-yellow-400'
              } font-bold`}
            >
              {playerIndex === 0 ? 'X' : 'O'}
            </span>
          </div>
          <div className="rounded-lg bg-gray-700 px-4 py-2 text-xl font-medium uppercase text-white">
            <span
              className={`${
                playerTurn === 0 ? 'text-blue-400' : 'text-yellow-400'
              } font-bold`}
            >
              {playerTurn === 0 ? 'X' : 'O'}
            </span>{' '}
            Turn
          </div>
        </div>
      )}

      {deadline !== null && (
        <div className="text-center mb-4">
          <div className="text-sm text-gray-500">
            {gameStarted ? 'Time left:' : 'Game will start in: '}
          </div>
          <div className="text-2xl font-bold">
            {timeLeft > 0
              ? new Date(timeLeft).toISOString().substr(14, 5)
              : '0:00'}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {squares.map((value, index) => (
          <Square
            key={index}
            value={value}
            onSquareClick={() => handleClick(index)}
          />
        ))}
      </div>
    </div>
  );
}
