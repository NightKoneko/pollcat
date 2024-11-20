import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import socket from '../socket.ts';
import PollVoting from './PollVoting';

interface Poll {
  id: number;
  question: string;
  options: string[];
}

const PollPage: React.FC = () => {
  const { pollId } = useParams<{ pollId: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);

  useEffect(() => {
    socket.emit('get-poll', parseInt(pollId!, 10), (fetchedPoll: Poll) => {
      setPoll(fetchedPoll);
    });

    return () => {
      socket.off('get-poll');
    };
  }, [pollId]);

  if (!poll) {
    return <p>Loading poll...</p>;
  }

  return (
    <div>
      <header>
        <Link to="/">Home</Link>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/';
          }}
        >
          Logout
        </button>
      </header>
      <PollVoting/>
    </div>
  );
};

export default PollPage;
