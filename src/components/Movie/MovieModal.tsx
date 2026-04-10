import { X, Star, Plus, Check, Film } from 'lucide-react';
import type { TMDBMovie } from '../../types/tmdb';
import { getPosterUrl } from '../../lib/tmdb';
import { useEffect } from 'react';

interface MovieModalProps {
  movie: TMDBMovie;
  inFavorites: boolean;
  onAdd: (movie: TMDBMovie) => void;
  onClose: () => void;
  adding?: boolean;
}

export default function MovieModal({ movie, inFavorites, onAdd, onClose, adding = false }: MovieModalProps) {
  const year = movie.release_date?.split('-')[0] || '';
  const poster = getPosterUrl(movie.poster_path);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header" style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            onClick={onClose}
            style={{ position: 'absolute', top: 16, right: 16 }}
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="modal-poster-wrap">
            {poster ? (
              <img src={poster} alt={movie.title} className="modal-poster" />
            ) : (
              <div className="modal-poster-placeholder">
                <Film size={32} />
              </div>
            )}
          </div>

          <div className="modal-meta">
            <h2 className="modal-title">{movie.title}</h2>
            <div className="modal-year-score">
              {year && <span className="modal-year">{year}</span>}
              {movie.vote_average > 0 && (
                <span className="modal-score">
                  <Star size={14} fill="currentColor" />
                  {movie.vote_average.toFixed(1)}
                </span>
              )}
            </div>
            {movie.overview && (
              <p className="modal-overview">{movie.overview}</p>
            )}
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-actions">
            <button
              className={`btn ${inFavorites ? 'btn-success' : 'btn-primary'}`}
              onClick={() => !inFavorites && onAdd(movie)}
              disabled={inFavorites || adding}
            >
              {inFavorites ? (
                <><Check size={16} /> Saved to Favorites</>
              ) : adding ? (
                <>Adding...</>
              ) : (
                <><Plus size={16} /> Add to Favorites</>
              )}
            </button>
            <button className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
