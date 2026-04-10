import { Plus, Check, Film } from 'lucide-react';
import type { TMDBMovie } from '../../types/tmdb';
import { getPosterUrl } from '../../lib/tmdb';

interface MovieCardProps {
  movie: TMDBMovie;
  inFavorites: boolean;
  onAdd: (movie: TMDBMovie) => void;
  onCardClick: (movie: TMDBMovie) => void;
  adding?: boolean;
}

export default function MovieCard({
  movie,
  inFavorites,
  onAdd,
  onCardClick,
  adding = false,
}: MovieCardProps) {
  const year = movie.release_date?.split('-')[0] || '';
  const poster = getPosterUrl(movie.poster_path);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inFavorites && !adding) onAdd(movie);
  };

  return (
    <div className="movie-card" onClick={() => onCardClick(movie)}>
      <div className="movie-poster-wrap">
        {poster ? (
          <img src={poster} alt={movie.title} className="movie-poster" loading="lazy" />
        ) : (
          <div className="movie-poster-placeholder">
            <Film size={28} />
            <span>No Image</span>
          </div>
        )}

        {inFavorites && <div className="movie-in-favorites">Saved</div>}

        {movie.vote_average > 0 && (
          <div className="movie-score">{movie.vote_average.toFixed(1)}</div>
        )}

        <div className="movie-overlay">
          <button
            className={`overlay-btn ${inFavorites ? 'overlay-btn-added' : 'overlay-btn-primary'}`}
            onClick={handleAddClick}
            disabled={inFavorites || adding}
            aria-label={inFavorites ? 'Already in favorites' : 'Add to favorites'}
          >
            {inFavorites ? (
              <><Check size={13} /> Saved</>
            ) : adding ? (
              <>Adding...</>
            ) : (
              <><Plus size={13} /> Add to Favorites</>
            )}
          </button>
          <button className="overlay-btn overlay-btn-secondary" onClick={(e) => { e.stopPropagation(); onCardClick(movie); }}>
            View Details
          </button>
        </div>
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        {year && <span className="movie-year">{year}</span>}
      </div>
    </div>
  );
}
