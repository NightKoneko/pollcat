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
    socket.on('active-polls', (deletePolls: Poll[]) => {
      setPolls(deletePolls);
    });

    return () => {
      socket.off('active-polls');
    };
  }, []);

  useEffect(() => {
    socket.on('error', (error) => {
      alert(error.message);
    });
  
    return () => {
      socket.off('error'); // Clean up on component unmount
    };
  }, []);
  

  const handleDeletePoll = (pollId: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this poll?');
    if (confirmDelete) {
      console.log(`Attempting to delete poll with ID: ${pollId}`);
      socket.emit('delete-poll', pollId); // Emit delete event 
    }
    else { socket.on('error', (error) => {
        alert(error.message);
      });
    }
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
