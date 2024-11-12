import React, { useEffect, useState } from 'react';
import socket from '../socket.ts';

interface Poll {
  id: number;
  question: string;
  options: string[];
}

interface ErrorMessage {
  [key: number]: string | null;
}

const DeletePolls: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [errorMessages, setErrorMessages] = useState<ErrorMessage>({});

  useEffect(() => {
    socket.on('active-polls', (polls) => {
      setPolls(polls);
    });

    return () => {
      socket.off('active-polls');
    };
  }, []);

  const handleDeletePoll = (pollId: number) => {
    console.log("Attempting to delete poll:", pollId);
    socket.emit('delete-poll', pollId, (response: { status: string, message?: string }) => {
      if (response.status === 'success') {
        console.log("Poll deleted successfully");

        setErrorMessages((prev) => ({ ...prev, [pollId]: null }));

        setPolls((prevPolls) => prevPolls.filter((poll) => poll.id !== pollId));
      } else {
        console.error(response.message || "Failed to delete poll");

        setErrorMessages((prev) => ({
          ...prev,
          [pollId]: response.message || "Only admins can delete polls.",
        }));
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
              <p> </p>
              {errorMessages[poll.id] && (
                <p style={{ color: 'red', marginTop: '4px' }}>{errorMessages[poll.id]}</p>
              )}
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