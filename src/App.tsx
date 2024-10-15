// src/App.tsx
import React from 'react';
import PollCreation from './components/PollCreation.tsx';
import PollVoting from './components/PollVoting.tsx';
import PollResults from './components/PollResults.tsx';

const App: React.FC = () => {
  return (
    <div>
      <h1>Poll</h1>
      <PollCreation />
      <PollVoting />
      <PollResults />
    </div>
  );
};

export default App;
