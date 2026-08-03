import React, { useEffect, useState } from 'react';

function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Grab token from URL after OAuth redirect
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');

    if (urlToken) {
      localStorage.setItem('github_token', urlToken);
      setToken(urlToken);
      // Clean the token out of the URL
      window.history.replaceState({}, document.title, '/');
    } else {
      // Check if already logged in
      const stored = localStorage.getItem('github_token');
      if (stored) setToken(stored);
    }
  }, []);

  const handleLogin = () => {
    window.location.href = 'http://localhost:3001/auth/github';
  };

  const handleLogout = () => {
    localStorage.removeItem('github_token');
    setToken(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      {token ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-400 mb-4">✅ Connected to GitHub</h1>
          <p className="text-gray-400 mb-6">PR Pilot is ready to review your pull requests.</p>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-medium"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">🚀 PR Pilot</h1>
          <p className="text-gray-400 mb-8">AI-powered code review for your pull requests</p>
          <button
            onClick={handleLogin}
            className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-lg font-semibold text-lg"
          >
            Connect GitHub
          </button>
        </div>
      )}
    </div>
  );
}

export default App;