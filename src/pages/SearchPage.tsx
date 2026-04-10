import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Film, Loader } from 'lucide-react';
import { searchMovies, getPopularMovies, getPosterUrl } from '../lib/tmdb';
import type { TMDBMovie } from '../types/tmdb';
import { useFavorites } from '../hooks/useFavorites';
import MovieCard from '../components/Movie/MovieCard';
import MovieModal from '../components/Movie/MovieModal';
import { ToastContainer, createToast, type ToastMessage } from '../components/UI/Toast';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
const DEBOUNCE_MS = 400;
const MAX_RESULTS = 10;

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [popular, setPopular] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [popularLoading, setPopularLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { isInFavorites, addFavorite } = useFavorites();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!TMDB_API_KEY) { setPopularLoading(false); return; }
    getPopularMovies(TMDB_API_KEY)
      .then(data => setPopular(data.slice(0, MAX_RESULTS)))
      .catch(() => {})
      .finally(() => setPopularLoading(false));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setMovies([]); setLoading(false); return; }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchMovies(query, TMDB_API_KEY);
        setMovies(results.slice(0, MAX_RESULTS));
      } catch {
        addToast('error', 'Failed to search. Check your TMDB API key.');
        setMovies([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const addToast = (type: 'success' | 'error', message: string) => {
    setToasts(prev => [...prev, createToast(type, message)]);
  };

  const handleAdd = async (movie: TMDBMovie) => {
    setAddingId(movie.id);
    const { error } = await addFavorite({
      movie_id: String(movie.id),
      title: movie.title,
      poster: getPosterUrl(movie.poster_path),
      year: movie.release_date?.split('-')[0] || '',
      overview: movie.overview || '',
    });

    if (!error) {
      addToast('success', `"${movie.title}" added to Favorites!`);
      if (selectedMovie?.id === movie.id) setSelectedMovie(null);
    } else if (error === 'Already in favorites') {
      addToast('error', 'Already in your favorites.');
    } else {
      addToast('error', 'Failed to add movie. Please try again.');
    }
    setAddingId(null);
  };

  const showSearch = query.trim().length > 0;
  const noApiKey = !TMDB_API_KEY;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Film size={28} />
          Discover Movies
        </h1>
        <p className="page-subtitle">Search for movies and save your favorites</p>
      </div>

      {noApiKey && (
        <div style={{
          background: 'var(--accent-muted)',
          border: '1px solid var(--accent)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: 24,
          fontSize: 14,
          color: 'var(--text-primary)',
        }}>
          Add your TMDB API key as <code style={{ background: 'var(--bg-elevated)', padding: '2px 5px', borderRadius: 3 }}>VITE_TMDB_API_KEY</code> to enable search.
        </div>
      )}

      <div className="search-bar-wrap">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search for a movie..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          {loading && <Loader size={18} className="spin" style={{ color: 'var(--accent)', flexShrink: 0 }} />}
          {query && !loading && (
            <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {showSearch ? (
        <section className="movie-section">
          <div className="section-header">
            <h2 className="section-title">
              Search Results
              {movies.length > 0 && <span className="section-count">({movies.length})</span>}
            </h2>
          </div>
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Searching...</span>
            </div>
          ) : movies.length === 0 ? (
            <div className="empty-state-large">
              <div className="empty-icon"><Search size={40} /></div>
              <h2>No results found</h2>
              <p>Try a different title or check your spelling.</p>
            </div>
          ) : (
            <div className="movie-grid">
              {movies.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  inFavorites={isInFavorites(String(movie.id))}
                  onAdd={handleAdd}
                  onCardClick={setSelectedMovie}
                  adding={addingId === movie.id}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="movie-section">
          <div className="section-header">
            <h2 className="section-title">
              <TrendingUp size={18} />
              Trending Now
            </h2>
          </div>
          {popularLoading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Loading movies...</span>
            </div>
          ) : popular.length === 0 ? (
            <div className="empty-state-large">
              <div className="empty-icon"><Film size={40} /></div>
              <h2>No movies available</h2>
              <p>Configure your TMDB API key to browse movies.</p>
            </div>
          ) : (
            <div className="movie-grid">
              {popular.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  inFavorites={isInFavorites(String(movie.id))}
                  onAdd={handleAdd}
                  onCardClick={setSelectedMovie}
                  adding={addingId === movie.id}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          inFavorites={isInFavorites(String(selectedMovie.id))}
          onAdd={handleAdd}
          onClose={() => setSelectedMovie(null)}
          adding={addingId === selectedMovie.id}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
}
