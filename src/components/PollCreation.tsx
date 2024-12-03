import React, { useState } from 'react';
import socket from '../socket.ts';

const PollCreation: React.FC = () => {
  const [question, setQuestion] = useState<string>('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [pollLink, setPollLink] = useState<string | null>(null);

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleCreatePoll = () => {
    if (question.trim() === '' || options.some(option => option.trim() === '')) {
      return;
    }
    socket.emit('create-poll', { question, options }, (response: { status: string; poll: any; link: string }) => {
      if (response.status === 'success') {
        setPollLink(response.link);
      }
    });
  
    setQuestion('');
    setOptions(['', '']);
  };

  return (
    <div className="container">
      <h2>Create Poll</h2>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Poll Question"
      />
      <div>
        {options.map((option, index) => (
          <div key={index}>
            <input 
              type="text" 
              value={option} 
              onChange={(e) => handleOptionChange(index, e.target.value)} 
              placeholder={`Option ${index + 1}`}
            />
          </div>
        ))}
      </div>
      <button onClick={handleAddOption}>Add Option</button>
      <button onClick={handleCreatePoll}>Create Poll</button>

      {pollLink && (
        <div className="poll-link">
          <p>Poll created! Share or open your poll:</p>
          <a href={pollLink} target="_blank" rel="noopener noreferrer">{pollLink}</a>
          <button onClick={() => navigator.clipboard.writeText(pollLink)}>Copy Link</button>
        </div>
      )}
    </div>
  );
};

export default PollCreation;