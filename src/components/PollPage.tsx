import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket.ts';

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
      <h2>{poll.question}</h2>
      <ul>
        {poll.options.map((option, index) => (
          <li key={index}>{option}</li>
        ))}
      </ul>
    </div>
  );
};

export default PollPage;