import React, { useEffect, useState } from 'react';
import PollCreation from './components/PollCreation';
import PollVoting from './components/PollVoting';
import PollResults from './components/PollResults';
import DeletePolls from './components/DeletePolls';
import Login from './components/Login';
import Register from './components/Register';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <div>
      <h1>Polls</h1>
      <div className="app-container">
        {isAuthenticated ? (
          <div className="authenticated-view">
            <div className="left-column">
              <PollCreation />
              <DeletePolls />
            </div>
            <div className="right-column">
              <PollVoting />
              <PollResults />
            </div>
          </div>
        ) : (
          <div className="auth-view">
            <Login onLogin={() => setIsAuthenticated(true)} />
            <Register />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
