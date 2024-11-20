import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PollCreation from './components/PollCreation';
import PollVoting from './components/PollVoting';
import PollResults from './components/PollResults';
import DeletePolls from './components/DeletePolls';
import Login from './components/Login';
import Register from './components/Register';
import PollPage from './components/PollPage';
//import axiosmeow from './components/AxiosMeow';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (token && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername(null);
  };

  return (
    <Router>
      <img className="pollcatlogo" src="\pollcatlogo.png"/>
      <div>
        <Routes>
          {isAuthenticated ? (
            <>
              <Route
                path="/"
                element={
                  <div className="app-container">
                    <div className="user-info">
                      <p>Logged in as: {username}</p>
                      <button className="logout-button" onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                    <div className="left-column">
                      <PollCreation />
                      <DeletePolls />
                    </div>
                    <div className="right-column">
                      <PollVoting />
                      <PollResults />
                    </div>
                  </div>
                }
              />
              <Route path="/poll/:pollId" element={<PollPage />} />
            </>
          ) : (
            <Route
              path="/"
              element={
                <div className="auth-view">
                  <Login
                    onLogin={(user) => {
                      setIsAuthenticated(true);
                      setUsername(user.username);
                      localStorage.setItem('username', user.username);
                    }}
                  />
                  <Register />
                </div>
              }
            />
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
