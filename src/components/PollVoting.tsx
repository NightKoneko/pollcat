import React, { useEffect, useState } from 'react';
import socket from '../socket.ts';

interface Poll {
  question: string;
  options: string[];
}

const PollVoting: React.FC = () => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    socket.on('poll', (pollData: Poll) => {
      setPoll(pollData);
    });

    return () => {
      socket.off('poll');
    };
  }, []);

  const handleVote = () => {
    if (selectedOption !== null && poll) {
      socket.emit('vote', { optionIndex: selectedOption });
    }
  };

  if (!poll) return <div>Loading poll...</div>;

  return (
    <div>
      <h2>{poll.question}</h2>
      <ul>
        {poll.options.map((option, index) => (
          <li key={index}>
            <label>
              <input 
                type="radio" 
                name="option" 
                value={index} 
                onChange={() => setSelectedOption(index)} 
              />
              {option}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={handleVote}>Submit Vote</button>
    </div>
  );
};

export default PollVoting;
