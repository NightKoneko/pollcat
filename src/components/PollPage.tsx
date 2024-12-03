import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PollVoting from './PollVoting.tsx'

const PollPage: React.FC = () => {
  const { pollId } = useParams();
  const [poll, setPoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/polls/${pollId}`)
      .then(response => {
        setPoll(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching poll:', error);
        setLoading(false);
      });
  }, [pollId]);

  if (loading) return <p>Loading poll...</p>;
  if (!poll) return <p>Poll not found.</p>;

  return (
    <div>
      <h2>{poll.question}</h2>
      <ul>
        {poll.options.map((option: string, index: number) => (
          <li key={index}>{option}</li>
        ))}
      </ul>
      <PollVoting></PollVoting>
    </div>
  );
};

export default PollPage;