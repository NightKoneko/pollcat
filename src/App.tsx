import React from 'react';
import PollCreation from './components/PollCreation';
import PollVoting from './components/PollVoting';
import PollResults from './components/PollResults';
import DeletePolls from './components/DeletePolls';

const App: React.FC = () => {
  return (
    <div>
      <h1>Polls</h1>
      <div className="app-container">
        <div className="left-column">
          <PollCreation />
          <DeletePolls />
        </div>
        <div className="right-column">
          <PollVoting />
          <PollResults />
        </div>
      </div>
    </div>
  );
};

export default App;
