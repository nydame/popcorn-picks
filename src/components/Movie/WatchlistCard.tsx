import { Trash2 } from 'lucide-react';
import type { WatchlistItem } from '../../types/database';
import StarRating from '../UI/StarRating';

interface WatchlistCardProps {
  item: WatchlistItem;
  onRate: (id: string, rating: number) => void;
  onRemove: (id: string) => void;
}

export default function WatchlistCard({
  item,
  onRate,
  onRemove,
}: WatchlistCardProps) {
  return (
    <div className="watchlist-card">
      <div className="watchlist-poster-wrap">
        {item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            className="watchlist-poster"
            loading="lazy"
          />
        ) : (
          <div className="watchlist-poster-placeholder">
            <span>No Image</span>
          </div>
        )}
      </div>
      <div className="watchlist-info">
        <div className="watchlist-meta">
          <h3 className="watchlist-title">{item.title}</h3>
          {item.year && <span className="watchlist-year">{item.year}</span>}
        </div>
        {item.overview && (
          <p className="watchlist-overview">{item.overview}</p>
        )}
        <div className="watchlist-footer">
          <div className="watchlist-rating">
            <span className="rating-label">
              {item.rating ? 'Your rating:' : 'Rate it:'}
            </span>
            <StarRating
              rating={item.rating}
              onChange={r => onRate(item.id, r)}
            />
          </div>
          <button
            className="remove-btn"
            onClick={() => onRemove(item.id)}
            aria-label="Remove from watchlist"
          >
            <Trash2 size={15} />
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
}
