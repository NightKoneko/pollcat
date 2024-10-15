import React, { useEffect, useState } from 'react';
import socket from '../socket.ts';

interface PollResults {
  options: string[];
  votes: number[];
}

const PollResults: React.FC = () => {
  const [results, setResults] = useState<PollResults | null>(null);

  useEffect(() => {
    socket.on('poll-results', (resultsData: PollResults) => {
      setResults(resultsData);
    });

    return () => {
      socket.off('poll-results');
    };
  }, []);

  if (!results) return <div>Loading results...</div>;

  return (
    <div>
      <h2>Poll Results</h2>
      <ul>
        {results.options.map((option, index) => (
          <li key={index}>
            {option}: {results.votes[index]} votes
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PollResults;
