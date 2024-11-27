import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PollCreation from './components/PollCreation';
import PollVoting from './components/PollVoting';
import PollResults from './components/PollResults';
import DeletePolls from './components/DeletePolls';
import Login from './components/Login';
import Register from './components/Register';
import PollPage from './components/PollPage';

const useAuth = () => {
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

  const login = (user: { username: string }) => {
    setIsAuthenticated(true);
    setUsername(user.username);
    localStorage.setItem('username', user.username);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  return { isAuthenticated, username, login, logout };
};

const AuthenticatedLayout: React.FC<{ onLogout: () => void; username: string }> = ({ onLogout, username }) => (
  <div className="app-container">
    <div className="user-info">
      <p>Logged in as: {username}</p>
      <button className="logout-button" onClick={onLogout}>
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
);

const UnauthenticatedLayout: React.FC<{ onLogin: (user: { username: string }) => void }> = ({ onLogin }) => (
  <div className="auth-view">
    <Login onLogin={onLogin} />
    <Register />
  </div>
);

const App: React.FC = () => {
  const { isAuthenticated, username, login, logout } = useAuth();

  return (
    <Router>
      <img className="pollcatlogo" src="/pollcatlogo.png" alt="PollCat Logo" />
      <div>
        <Routes>
          {isAuthenticated ? (
            <>
              <Route
                path="/"
                element={<AuthenticatedLayout onLogout={logout} username={username!} />}
              />
              <Route path="/poll/:pollId" element={<PollPage />} />
            </>
          ) : (
            <Route path="/" element={<UnauthenticatedLayout onLogin={login} />} />
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;