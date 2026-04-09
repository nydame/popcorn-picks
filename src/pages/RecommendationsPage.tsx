import { useState } from 'react';
import { Sparkles, Loader as Loader2, Film, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWatchlist } from '../hooks/useWatchlist';
import { getPosterUrl, searchMovies } from '../lib/tmdb';
import { ToastContainer, createToast, type ToastMessage } from '../components/UI/Toast';
import { useAuth } from '../contexts/AuthContext';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';

interface RecommendedMovie {
  title: string;
  year?: string;
  reason: string;
  poster?: string;
}

export default function RecommendationsPage() {
  const { user } = useAuth();
  const { watchlist, addToWatchlist, isInWatchlist } = useWatchlist();
  const [prompt, setPrompt] = useState('');
  const [recommendations, setRecommendations] = useState<RecommendedMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [addingTitle, setAddingTitle] = useState<string | null>(null);

  const addToast = (type: 'success' | 'error', message: string) => {
    setToasts(prev => [...prev, createToast(type, message)]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleGetRecommendations = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setRecommendations([]);

    try {
      const watchlistTitles = watchlist.map(w => w.title).slice(0, 10);
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: { prompt, watchlist: watchlistTitles },
      });

      if (error) throw new Error(error.message);

      const recs: RecommendedMovie[] = data.recommendations || [];

      if (TMDB_API_KEY) {
        const withPosters = await Promise.all(
          recs.map(async rec => {
            try {
              const results = await searchMovies(rec.title, TMDB_API_KEY);
              const match = results[0];
              return {
                ...rec,
                poster: match ? getPosterUrl(match.poster_path) : undefined,
              };
            } catch {
              return rec;
            }
          })
        );
        setRecommendations(withPosters);
      } else {
        setRecommendations(recs);
      }
    } catch {
      addToast('error', 'Failed to get recommendations. Check your OpenAI API key configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRec = async (rec: RecommendedMovie) => {
    if (!user) {
      addToast('error', 'Please sign in to add movies.');
      return;
    }
    setAddingTitle(rec.title);
    try {
      let movieId = `rec-${rec.title.toLowerCase().replace(/\s+/g, '-')}`;
      let poster = rec.poster || '';

      if (TMDB_API_KEY) {
        const results = await searchMovies(rec.title, TMDB_API_KEY);
        if (results[0]) {
          movieId = String(results[0].id);
          poster = getPosterUrl(results[0].poster_path);
        }
      }

      const { error } = await addToWatchlist({
        movie_id: movieId,
        title: rec.title,
        poster,
        year: rec.year || '',
        overview: rec.reason,
      });

      if (error && error !== 'Already in watchlist') {
        addToast('error', error);
      } else {
        addToast('success', `"${rec.title}" added to watchlist!`);
      }
    } catch {
      addToast('error', 'Failed to add movie.');
    } finally {
      setAddingTitle(null);
    }
  };

  const suggestions = [
    'Something like Inception but more emotional',
    'A relaxing feel-good comedy for the weekend',
    'Critically acclaimed sci-fi from the last 5 years',
    'Thriller with unexpected plot twists',
    'Classic 90s action movies I might have missed',
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Sparkles size={28} />
          AI Movie Picks
        </h1>
        <p className="page-subtitle">
          Describe what you're in the mood for and get personalized movie recommendations
        </p>
      </div>

      <div className="rec-input-section">
        <div className="rec-textarea-wrap">
          <textarea
            className="rec-textarea"
            placeholder="Describe what kind of movie you want to watch... (e.g., 'Something like Interstellar but more character-driven' or 'A cozy romance movie for a rainy evening')"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={3}
          />
        </div>

        <div className="suggestion-chips">
          {suggestions.map(s => (
            <button
              key={s}
              className="suggestion-chip"
              onClick={() => setPrompt(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          className="btn btn-primary btn-get-recs"
          onClick={handleGetRecommendations}
          disabled={!prompt.trim() || loading}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="spin" />
              Getting recommendations...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Get Recommendations
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="rec-loading">
          <div className="rec-loading-dots">
            <span />
            <span />
            <span />
          </div>
          <p>AI is thinking of the perfect movies for you...</p>
        </div>
      )}

      {recommendations.length > 0 && (
        <section className="rec-results">
          <h2 className="section-title">Your Personalized Picks</h2>
          <div className="rec-grid">
            {recommendations.map((rec, i) => (
              <div key={i} className="rec-card">
                <div className="rec-poster-wrap">
                  {rec.poster ? (
                    <img src={rec.poster} alt={rec.title} className="rec-poster" />
                  ) : (
                    <div className="rec-poster-placeholder">
                      <Film size={32} />
                    </div>
                  )}
                </div>
                <div className="rec-info">
                  <div className="rec-header">
                    <h3 className="rec-title">{rec.title}</h3>
                    {rec.year && <span className="rec-year">{rec.year}</span>}
                  </div>
                  <p className="rec-reason">{rec.reason}</p>
                  <div className="rec-actions">
                    <button
                      className={`btn btn-sm ${isInWatchlist(`rec-${rec.title.toLowerCase().replace(/\s+/g, '-')}`) ? 'btn-ghost' : 'btn-primary'}`}
                      onClick={() => handleAddRec(rec)}
                      disabled={addingTitle === rec.title}
                    >
                      {addingTitle === rec.title ? (
                        <><Loader2 size={13} className="spin" /> Adding...</>
                      ) : (
                        <><Search size={13} /> Add to Watchlist</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
