// this needs to be fixed, deleting polls crashes the server

import React, { useEffect, useState } from 'react';
import socket from '../socket.ts';

interface Poll {
  id: number;
  question: string;
  options: string[];
}

const ActivePolls: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);

  useEffect(() => {
    // Listen for active polls from the server
    socket.on('active-polls', (activePolls: Poll[]) => {
      setPolls(activePolls);
    });

    return () => {
      socket.off('active-polls');
    };
  }, []);

  const handleDeletePoll = (pollId: number) => {
    socket.emit('delete-poll', pollId);
  };

  return (
    <div className="container">
      <h2>Active Polls</h2>
      {polls.length > 0 ? (
        <ul>
          {polls.map((poll) => (
            <li key={poll.id} className="active-poll-item">
              <strong>{poll.question}</strong>
              <button onClick={() => handleDeletePoll(poll.id)} className="delete-button">
                Delete Poll
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No active polls.</p>
      )}
    </div>
  );
};

export default ActivePolls;
