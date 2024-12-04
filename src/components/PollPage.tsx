import React, { useEffect, useState } from 'react';
import socket from '../socket.ts';
import { useParams } from 'react-router-dom';
import './PollVoting.css';

const PollPage: React.FC = () => {
  interface Poll {
    id: number;
    question: string;
    options: string[];
  }

  interface PollResults {
    pollId: number;
    options: string[];
    votes: number[];
  }

  const { pollId } = useParams<{ pollId: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [pollResults, setPollResults] = useState<PollResults | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [pollFetched, setPollFetched] = useState(false); // Ensures data fetch retry

  useEffect(() => {
    const fetchPollData = () => {
      setPollFetched(false);
      socket.emit('request-polls'); // Trigger poll fetch
    };

    // Listen to incoming poll data
    const handleActivePolls = (activePolls: Poll[]) => {
      const foundPoll = activePolls.find((p) => p.id === parseInt(pollId || '', 10));
      if (foundPoll) {
        setPoll(foundPoll);
        setHasVoted(checkIfVoted(foundPoll.id));
        socket.emit('request-poll-results', foundPoll.id); // Fetch results
        setPollFetched(true); // Mark poll as fetched
      } else {
        setPoll(null);
        setPollFetched(true); // No poll found
      }
    };

    const handlePollResults = (results: PollResults) => {
      if (results.pollId === parseInt(pollId || '', 10)) {
        setPollResults(results);
      }
    };

    const handleVoteFailed = (message: string) => {
      setVoteError(message);
    };

    // Attach socket listeners
    socket.on('active-polls', handleActivePolls);
    socket.on('poll-results', handlePollResults);
    socket.on('vote-failed', handleVoteFailed);

    // Fetch data on mount
    fetchPollData();

    // Cleanup listeners on unmount
    return () => {
      socket.off('active-polls', handleActivePolls);
      socket.off('poll-results', handlePollResults);
      socket.off('vote-failed', handleVoteFailed);
    };
  }, [pollId]);

  const checkIfVoted = (pollId: number) => {
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
    return votedPolls.includes(pollId);
  };

  const handleVote = () => {
    if (selectedOption !== null && !hasVoted) {
      socket.emit('vote', { pollId: poll?.id, optionIndex: selectedOption });

      const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
      votedPolls.push(poll?.id);
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls));

      setHasVoted(true);
      setSelectedOption(null);
      setVoteError(null);
    } else {
      setVoteError('You have already voted or no option selected.');
    }
  };

  if (!pollFetched) {
    return <p>Loading poll...</p>;
  }

  if (!poll) {
    return <p>Poll not found.</p>;
  }

  return (
    <div className="poll-container">
      <h2>{poll.question}</h2>
      {pollResults ? (
        <div className="poll-results">
          <h4>Results</h4>
          <ul>
            {pollResults.options.map((option, index) => (
              <li key={index}>
                {option}: {pollResults.votes[index]} votes
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Loading results...</p>
      )}

      <div className="poll-options">
        <ul>
          {poll.options.map((option, index) => (
            <li key={index}>
              <label>
                <input
                  type="radio"
                  name={`option-${poll.id}`}
                  value={index}
                  onChange={() => setSelectedOption(index)}
                  checked={selectedOption === index}
                  disabled={hasVoted}
                />
                {option}
              </label>
            </li>
          ))}
        </ul>
        <button
          onClick={handleVote}
          disabled={selectedOption === null || hasVoted}
          className="vote-button"
        >
          {hasVoted ? 'Already Voted' : 'Submit Vote'}
        </button>
        {voteError && <p className="error">{voteError}</p>}
      </div>
    </div>
  );
};

export default PollPage;