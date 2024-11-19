//I'll redo this later

/**
import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import socket from '../socket.ts';

interface PollResult {
  option: string;
  votes: number;
}

const PollResultsChart: React.FC<{ pollId: number }> = ({ pollId }) => {
  const [pollData, setPollData] = useState<PollResult[]>([]);

  useEffect(() => {
    socket.on(`poll-results-${pollId}`, (results: PollResult[]) => {
      setPollData(results);
    });

    return () => {
      socket.off(`poll-results-${pollId}`);
    };
  }, [pollId]);

  const data = {
    labels: pollData.map((result) => result.option),
    datasets: [
      {
        data: pollData.map((result) => result.votes),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h3>Poll Results</h3>
      <Pie data={data} />
    </div>
  );
};

export default PollResultsChart;
*/