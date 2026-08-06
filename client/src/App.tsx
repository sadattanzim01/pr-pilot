import React, { useEffect, useState } from 'react';
import axios from 'axios';

//base URL for all API calls to our Express server
const API = 'http://localhost:3001';

//shape of a pull request review stored in our database
interface PR {
  id: number;
  repo_full_name: string; //"sadattanzim01/pr-pilot-test"
  pr_number: number;
  title: string;
  status: string;// "pending" or "completed"
  review: string;// Claude's full review text
  created_at: string;
}

// Shape of a GitHub user returned by the GitHub API
interface GitHubUser {
  login: string;// GitHub username
  avatar_url: string;// Profile picture URL
  name: string;// Display name
}

function App() {
  const [token, setToken] = useState<string | null>(null);// GitHub OAuth token
  const [user, setUser] = useState<GitHubUser | null>(null);// Logged in GitHub user
  const [reviews, setReviews] = useState<PR[]>([]);// All PR reviews from DB
  const [selectedPR, setSelectedPR] = useState<PR | null>(null);// PR being viewed in detail
  const [loading, setLoading] = useState(false);// Loading state for reviews

  //on page load: check if GitHub just redirected back with a token in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      //save token to localStorage so user stays logged in after refresh
      localStorage.setItem('github_token', urlToken);
      setToken(urlToken);
      //clean the token out of the URL bar
      window.history.replaceState({}, document.title, '/');
    } else {
      //no token in URL — check if user was already logged in
      const stored = localStorage.getItem('github_token');
      if (stored) setToken(stored);
    }
  }, []);

  //when token is available, fetch the GitHub user info and all reviews
  useEffect(() => {
    if (!token) return;
    setLoading(true);

    //fetch GitHub user info (name, avatar) using the token
    axios.get(`${API}/api/user`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setUser(res.data)).catch(console.error);

    //fetch all PR reviews stored in our Supabase database
    axios.get(`${API}/api/reviews`)
      .then(res => setReviews(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  //redirect user to GitHub OAuth login page
  const handleLogin = () => {
    window.location.href = `${API}/auth/github`;
  };

  //clear token and reset all state (logout)
  const handleLogout = () => {
    localStorage.removeItem('github_token');
    setToken(null);
    setUser(null);
    setReviews([]);
  };

  //convert Claude's plain text review into formatted React elements
  const formatReview = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-6 mb-2 text-white">{line.replace('## ', '')}</h2>;
      if (line.startsWith('# '))  return <h1 key={i} className="text-2xl font-bold mt-4 mb-2 text-white">{line.replace('# ', '')}</h1>;
      if (line.startsWith('- ') || line.startsWith('• ')) return <li key={i} className="ml-4 text-gray-300 list-disc">{line.replace(/^[-•] /, '')}</li>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-gray-300 mb-1">{line}</p>;
    });
  };

  //SCREEN 1: Not logged in
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🚀</div>
          <h1 className="text-5xl font-bold text-white mb-3">PR Pilot</h1>
          <p className="text-gray-400 text-lg mb-8">
            AI-powered code reviews, automatically posted to your pull requests.
          </p>
          <button
            onClick={handleLogin}
            className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-lg font-semibold text-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <span>🐙</span> Connect GitHub
          </button>
        </div>
      </div>
    );
  }

  //SCREEN 2: Viewing a single PR review in detail
  if (selectedPR) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto p-6">
          {/* Back button returns to dashboard */}
          <button
            onClick={() => setSelectedPR(null)}
            className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            {/* PR metadata */}
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full font-medium">
                {selectedPR.status}
              </span>
              <span className="text-gray-500 text-sm">
                {selectedPR.repo_full_name} • PR #{selectedPR.pr_number}
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-6">{selectedPR.title}</h1>
            {/* Claude's formatted review */}
            <div className="border-t border-gray-800 pt-6">
              {formatReview(selectedPR.review)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  //SCREEN 3: Main dashboard
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Top navigation bar */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="PR Pilot" className="w-8 h-8 rounded-md" />
          <h1 className="text-xl font-bold">PR Pilot</h1>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={user.avatar_url} alt={user.login} className="w-8 h-8 rounded-full" />
              <span className="text-gray-300 text-sm">{user.name || user.login}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-white text-sm transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto p-6">

        {/* Stats cards — counts reviews by status */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-3xl font-bold text-white">{reviews.length}</div>
            <div className="text-gray-500 text-sm mt-1">Total Reviews</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-3xl font-bold text-green-400">
              {reviews.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-gray-500 text-sm mt-1">Completed</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-3xl font-bold text-yellow-400">
              {reviews.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-gray-500 text-sm mt-1">Pending</div>
          </div>
        </div>

        {/* List of all PR reviews — click any to see full review */}
        <h2 className="text-lg font-semibold mb-4 text-gray-300">Recent Reviews</h2>
        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
            <div className="text-4xl mb-3">🤖</div>
            <p className="text-gray-400">No reviews yet. Open a PR on a connected repo to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(pr => (
              <div
                key={pr.id}
                onClick={() => setSelectedPR(pr)}
                className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-600 cursor-pointer transition-all hover:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Status badge — green for completed, yellow for pending */}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        pr.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {pr.status}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {pr.repo_full_name} • PR #{pr.pr_number}
                      </span>
                    </div>
                    <p className="text-white font-medium truncate">{pr.title}</p>
                  </div>
                  <span className="text-gray-600 ml-4">→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;