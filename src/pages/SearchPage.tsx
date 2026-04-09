import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Loader2, TrendingUp } from 'lucide-react';
import { searchMovies, getPopularMovies, getPosterUrl } from '../lib/tmdb';
import type { TMDBMovie } from '../types/tmdb';
import MovieCard from '../components/Movie/MovieCard';
import { useWatchlist } from '../hooks/useWatchlist';
import { ToastContainer, createToast, type ToastMessage } from '../components/UI/Toast';
import { useAuth } from '../contexts/AuthContext';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';

export default function SearchPage() {
  const { user } = useAuth();
  const { addToWatchlist, isInWatchlist } = useWatchlist();
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [popular, setPopular] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [addingId, setAddingId] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!TMDB_API_KEY) return;
    getPopularMovies(TMDB_API_KEY).then(setPopular).catch(() => {});
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setMovies([]);
      return;
    }
    setLoading(true);
    try {
      const results = await searchMovies(q, TMDB_API_KEY);
      setMovies(results);
    } catch {
      setToasts(prev => [...prev, createToast('error', 'Failed to search movies. Check your TMDB API key.')]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const handleAdd = async (movie: TMDBMovie) => {
    if (!user) {
      addToast('error', 'Please sign in to add movies.');
      return;
    }
    setAddingId(movie.id);
    const { error } = await addToWatchlist({
      movie_id: String(movie.id),
      title: movie.title,
      poster: getPosterUrl(movie.poster_path),
      year: movie.release_date?.split('-')[0] || '',
      overview: movie.overview,
    });
    setAddingId(null);
    if (error && error !== 'Already in watchlist') {
      addToast('error', error);
    } else if (!error) {
      addToast('success', `"${movie.title}" added to watchlist!`);
    }
  };

  const addToast = (type: 'success' | 'error', message: string) => {
    setToasts(prev => [...prev, createToast(type, message)]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const displayMovies = query.trim() ? movies : [];
  const showPopular = !query.trim() && popular.length > 0;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Discover Movies</h1>
        <p className="page-subtitle">Search millions of movies and build your watchlist</p>
      </div>

      <div className="search-bar-wrap">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search for a movie..."
            value={query}
            onChange={handleChange}
            autoFocus
          />
          {loading && <Loader2 size={20} className="search-spinner" />}
        </div>
      </div>

      {!TMDB_API_KEY && (
        <div className="api-notice">
          <strong>TMDB API key required.</strong> Add <code>VITE_TMDB_API_KEY</code> to your <code>.env</code> file to enable search.
        </div>
      )}

      {query.trim() && !loading && displayMovies.length === 0 && (
        <div className="empty-state">
          <p>No movies found for "{query}"</p>
        </div>
      )}

      {displayMovies.length > 0 && (
        <section className="movie-section">
          <h2 className="section-title">Search Results</h2>
          <div className="movie-grid">
            {displayMovies.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                inWatchlist={isInWatchlist(String(movie.id))}
                onAdd={handleAdd}
                adding={addingId === movie.id}
              />
            ))}
          </div>
        </section>
      )}

      {showPopular && (
        <section className="movie-section">
          <h2 className="section-title">
            <TrendingUp size={20} />
            Trending Now
          </h2>
          <div className="movie-grid">
            {popular.slice(0, 12).map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                inWatchlist={isInWatchlist(String(movie.id))}
                onAdd={handleAdd}
                adding={addingId === movie.id}
              />
            ))}
          </div>
        </section>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
