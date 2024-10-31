import React, { useEffect, useState } from 'react';
import socket from '../socket.ts';
import './PollVoting.css';

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

const PollVoting: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [expandedPollId, setExpandedPollId] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [pollResults, setPollResults] = useState<{ [key: number]: PollResults }>({});
  const [voteError, setVoteError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    socket.emit('request-polls');
    socket.on('active-polls', (activePolls: Poll[]) => {
      setPolls(activePolls);
    });

    socket.on('poll-results', (results: PollResults) => {
      setPollResults(prevResults => ({
        ...prevResults,
        [results.pollId]: results,
      }));
    });

    socket.on('vote-failed', (message: string) => {
      setVoteError(message);
    });

    return () => {
      socket.off('active-polls');
      socket.off('poll-results');
      socket.off('vote-failed');
    };
  }, []);

  const checkIfVoted = (pollId: number) => {
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
    return votedPolls.includes(pollId);
  };

  const handleVote = (pollId: number) => {
    if (selectedOption !== null && !hasVoted[pollId]) {
      socket.emit('vote', { pollId, optionIndex: selectedOption });
  
      const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
      votedPolls.push(pollId);
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
  
      setHasVoted({ ...hasVoted, [pollId]: true });
      setSelectedOption(null);
      setVoteError(null);
    } else {
      setVoteError("You have already voted or no option selected.");
    }
  };  

  const togglePoll = (pollId: number) => {
    if (expandedPollId === pollId) {
      setExpandedPollId(null);
    } else {
      setExpandedPollId(pollId);

      socket.emit('toggle-poll', pollId);
      socket.emit('request-poll-results', pollId);
    }

    setHasVoted({ ...hasVoted, [pollId]: checkIfVoted(pollId) });
  };

  return (
    <div className="poll-container">
      <h2>Active Polls</h2>
      {polls.length > 0 ? (
        <ul className="poll-list">
          {polls.map((poll) => (
            <li key={poll.id} className="poll-item">
              <div className="poll-title" onClick={() => togglePoll(poll.id)}>
                <h3>{poll.question}</h3>
                <button className="toggle-button">
                  {expandedPollId === poll.id ? '-' : '+'}
                </button>
              </div>
              {expandedPollId === poll.id && (
                <div className="poll-details">
                  {pollResults[poll.id] ? (
                    <div className="poll-results">
                      <h4>Results</h4>
                      <ul>
                        {pollResults[poll.id].options.map((option, index) => (
                          <li key={index}>
                            {option}: {pollResults[poll.id].votes[index]} votes
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
                              disabled={hasVoted[poll.id]}
                            />
                            {option}
                          </label>
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={() => handleVote(poll.id)} 
                      disabled={selectedOption === null || hasVoted[poll.id]}
                      className="vote-button"
                    >
                      {hasVoted[poll.id] ? 'Already Voted' : 'Submit Vote'}
                    </button>
                    {voteError && <p className="error">{voteError}</p>}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No active polls to vote on.</p>
      )}
    </div>
  );
};

export default PollVoting;