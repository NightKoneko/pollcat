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

  if (!results) return <div></div>;
};

export default PollResults;
