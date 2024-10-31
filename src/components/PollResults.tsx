// This can probably be deleted tbh

import React, { useEffect, useState } from 'react';
import socket from '../socket.ts';

interface PollResults {
  options: string[];
  votes: number[];
}

const PollResults: React.FC = () => {
  const [results, setResults] = useState<PollResults | null>(null);

  useEffect(() => {
    socket.emit('request-poll-results');
    socket.on('poll-results', (resultsData: PollResults) => setResults(resultsData));
    return () => {
      socket.off('poll-results');
    };
  }, []);

  if (!results) return <div></div>;

  // return (
  //   <div>
  //     <h3>Poll Results</h3>
  //     {results.options.map((option, index) => (
  //       <p key={index}>{option}: {results.votes[index]} votes</p>
  //     ))}
  //   </div>
  // );
};


export default PollResults;
