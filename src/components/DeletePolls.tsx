// this needs to be fixed, deleting polls crashes the server
// ^^ I think above is fixed but I'm leaving it here for now

import React, { useEffect, useState } from 'react';
import socket from '../socket.ts';

interface Poll {
  id: number;
  question: string;
  options: string[];
}

const DeletePolls: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);

  useEffect(() => {
    socket.on('active-polls', (polls) => {
      setPolls(polls);
    });
  
    return () => {
      socket.off('active-polls'); // Clean up listener on unmount
    };
  }, []);
  

  const handleDeletePoll = (pollId: number) => {
    console.log("Attempting to delete poll:", pollId); // Debug log
    socket.emit('delete-poll', pollId, (response: { status: string }) => {
      if (response.status === 'success') {
        console.log("Poll deleted successfully");
      } else {
        console.error("Failed to delete poll");
      }
    });
  };  

  return (
    <div className="container">
      <h2>Delete Polls</h2>
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

export default DeletePolls;