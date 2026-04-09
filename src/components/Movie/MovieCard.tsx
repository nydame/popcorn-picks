import { Plus, Check } from 'lucide-react';
import type { TMDBMovie } from '../../types/tmdb';
import { getPosterUrl } from '../../lib/tmdb';

interface MovieCardProps {
  movie: TMDBMovie;
  inWatchlist: boolean;
  onAdd: (movie: TMDBMovie) => void;
  adding?: boolean;
}

export default function MovieCard({
  movie,
  inWatchlist,
  onAdd,
  adding = false,
}: MovieCardProps) {
  const year = movie.release_date?.split('-')[0] || 'N/A';
  const poster = getPosterUrl(movie.poster_path);

  return (
    <div className="movie-card">
      <div className="movie-poster-wrap">
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            className="movie-poster"
            loading="lazy"
          />
        ) : (
          <div className="movie-poster-placeholder">
            <span>No Image</span>
          </div>
        )}
        <div className="movie-overlay">
          <button
            className={`add-btn ${inWatchlist ? 'add-btn-added' : ''}`}
            onClick={() => !inWatchlist && onAdd(movie)}
            disabled={inWatchlist || adding}
            aria-label={inWatchlist ? 'Already in watchlist' : 'Add to watchlist'}
          >
            {inWatchlist ? (
              <>
                <Check size={14} />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus size={14} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
        {movie.vote_average > 0 && (
          <div className="movie-score">
            {movie.vote_average.toFixed(1)}
          </div>
        )}
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <span className="movie-year">{year}</span>
      </div>
    </div>
  );
}
