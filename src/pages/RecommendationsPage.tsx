import { useState } from 'react';
import { Sparkles, Loader, Film, Plus, Check, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useFavorites } from '../hooks/useFavorites';
import { getPosterUrl, searchMovies } from '../lib/tmdb';
import { ToastContainer, createToast, type ToastMessage } from '../components/UI/Toast';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';

interface RecommendedMovie {
  title: string;
  year?: string;
  reason: string;
  poster?: string;
  movie_id?: string;
}

export default function RecommendationsPage() {
  const { favorites, isInFavorites, addFavorite } = useFavorites();
  const [prompt, setPrompt] = useState('');
  const [recommendations, setRecommendations] = useState<RecommendedMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [addingTitle, setAddingTitle] = useState<string | null>(null);

  const addToast = (type: 'success' | 'error', message: string) => {
    setToasts(prev => [...prev, createToast(type, message)]);
  };

  const favoriteTitles = favorites.map(f => f.title);

  const handleGetRecommendations = async () => {
    const finalPrompt = prompt.trim() || `Based on my favorites: ${favoriteTitles.slice(0, 8).join(', ')}`;
    if (!finalPrompt) return;

    setLoading(true);
    setRecommendations([]);

    try {
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: { prompt: finalPrompt, watchlist: favoriteTitles.slice(0, 10) },
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
                movie_id: match ? String(match.id) : undefined,
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
      addToast('error', 'Failed to get recommendations. Check your OpenAI API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRec = async (rec: RecommendedMovie) => {
    setAddingTitle(rec.title);
    try {
      const movieId = rec.movie_id || `rec-${rec.title.toLowerCase().replace(/\s+/g, '-')}`;
      const { error } = await addFavorite({
        movie_id: movieId,
        title: rec.title,
        poster: rec.poster || '',
        year: rec.year || '',
        overview: rec.reason,
      });

      if (!error) {
        addToast('success', `"${rec.title}" added to Favorites!`);
      } else if (error === 'Already in favorites') {
        addToast('error', 'Already in your favorites.');
      } else {
        addToast('error', 'Failed to add movie.');
      }
    } catch {
      addToast('error', 'Failed to add movie.');
    } finally {
      setAddingTitle(null);
    }
  };

  const getRecMovieId = (rec: RecommendedMovie) =>
    rec.movie_id || `rec-${rec.title.toLowerCase().replace(/\s+/g, '-')}`;

  const suggestions = [
    'Something like Inception but more emotional',
    'A feel-good comedy for the weekend',
    'Critically acclaimed sci-fi from the last 5 years',
    'Thriller with unexpected plot twists',
    'Classic 90s films I might have missed',
  ];

  if (favorites.length === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title"><Sparkles size={28} /> AI Recommendations</h1>
          <p className="page-subtitle">Get personalized movie recommendations powered by AI</p>
        </div>
        <div className="empty-state-large">
          <div className="empty-icon"><Heart size={48} /></div>
          <h2>Add some favorites first</h2>
          <p>Save at least a few movies to get tailored AI recommendations.</p>
          <Link to="/search" className="btn btn-primary" style={{ marginTop: 8 }}>
            Browse Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title"><Sparkles size={28} /> AI Recommendations</h1>
        <p className="page-subtitle">Personalized picks based on your favorites</p>
      </div>

      <div className="rec-input-section">
        {favoriteTitles.length > 0 && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Based on your favorites:
            </p>
            <div className="rec-favorites-preview">
              {favoriteTitles.slice(0, 8).map(title => (
                <span key={title} className="rec-fav-chip">{title}</span>
              ))}
              {favoriteTitles.length > 8 && (
                <span className="rec-fav-chip">+{favoriteTitles.length - 8} more</span>
              )}
            </div>
          </div>
        )}

        <textarea
          className="rec-textarea"
          placeholder="Describe what you're in the mood for... (optional — leave blank to get picks based on your favorites)"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={3}
        />

        <div className="suggestion-chips">
          {suggestions.map(s => (
            <button key={s} className="suggestion-chip" onClick={() => setPrompt(s)}>
              {s}
            </button>
          ))}
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={handleGetRecommendations}
          disabled={loading}
        >
          {loading ? (
            <><Loader size={18} className="spin" /> Getting recommendations...</>
          ) : (
            <><Sparkles size={18} /> Get Recommendations</>
          )}
        </button>
      </div>

      {loading && (
        <div className="rec-loading">
          <div className="rec-loading-dots">
            <span /><span /><span />
          </div>
          <p>AI is finding the perfect movies for you...</p>
        </div>
      )}

      {recommendations.length > 0 && (
        <section className="rec-results">
          <div className="section-header">
            <h2 className="section-title">Your Personalized Picks</h2>
          </div>
          <div className="rec-grid">
            {recommendations.map((rec, i) => {
              const movieId = getRecMovieId(rec);
              const alreadySaved = isInFavorites(movieId);
              return (
                <div key={i} className="rec-card">
                  <div className="rec-poster-wrap">
                    {rec.poster ? (
                      <img src={rec.poster} alt={rec.title} className="rec-poster" />
                    ) : (
                      <div className="rec-poster-placeholder">
                        <Film size={28} />
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
                        className={`btn btn-sm ${alreadySaved ? 'btn-success' : 'btn-primary'}`}
                        onClick={() => !alreadySaved && handleAddRec(rec)}
                        disabled={addingTitle === rec.title || alreadySaved}
                      >
                        {alreadySaved ? (
                          <><Check size={13} /> Saved</>
                        ) : addingTitle === rec.title ? (
                          <>Adding...</>
                        ) : (
                          <><Plus size={13} /> Add to Favorites</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <ToastContainer toasts={toasts} onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
}
