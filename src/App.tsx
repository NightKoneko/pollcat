import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import PollCreation from './components/PollCreation';
import PollVoting from './components/PollVoting';
import PollResults from './components/PollResults';
import DeletePolls from './components/DeletePolls';
import Login from './components/Login';
import Register from './components/Register';
import PollPage from './components/PollPage';
import About from './components/About';

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

const ScrollToTop: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

const App: React.FC = () => {
  const { isAuthenticated, username, login, logout } = useAuth();

  return (
    <Router>
      <ScrollToTop />
      <p className="problem">If some things don't show up/aren't working, refresh the page and wait. <br /> The server can be a bit unreliable, sorry.</p>
      <img className="pollcatlogo" src="/pollcatlogo.png" alt="Pollcat Logo" />
      <div>
        <About />
        <Routes>
          {isAuthenticated ? (
            <>
              <Route
                path="/"
                element={<AuthenticatedLayout onLogout={logout} username={username!} />}
              />
              <Route path="/poll/:pollId" element={<PollPage />} />
              <Route path="/about" element={<About />} />
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
