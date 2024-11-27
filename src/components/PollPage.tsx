import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
//import socket from '../socket.ts';
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
    fetch(`https://pollcat.vercel.app/polls/${pollId}`)
      .then(response => response.json())
      .then(data => setPoll(data))
      .catch(() => setPoll(null));
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
