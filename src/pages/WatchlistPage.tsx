import { BookMarked, Film } from 'lucide-react';
import { useWatchlist } from '../hooks/useWatchlist';
import WatchlistCard from '../components/Movie/WatchlistCard';
import { ToastContainer, createToast, type ToastMessage } from '../components/UI/Toast';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function WatchlistPage() {
  const { watchlist, loading, updateRating, removeFromWatchlist } = useWatchlist();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    setToasts(prev => [...prev, createToast(type, message)]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleRate = async (id: string, rating: number) => {
    const { error } = await updateRating(id, rating);
    if (error) addToast('error', 'Failed to update rating.');
    else addToast('success', 'Rating updated!');
  };

  const handleRemove = async (id: string) => {
    const item = watchlist.find(w => w.id === id);
    const { error } = await removeFromWatchlist(id);
    if (error) addToast('error', 'Failed to remove movie.');
    else addToast('success', `"${item?.title}" removed from watchlist.`);
  };

  const rated = watchlist.filter(w => w.rating !== null);
  const unrated = watchlist.filter(w => w.rating === null);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <BookMarked size={28} />
          My Watchlist
        </h1>
        <p className="page-subtitle">
          {watchlist.length} movie{watchlist.length !== 1 ? 's' : ''} saved
          {rated.length > 0 && ` · ${rated.length} rated`}
        </p>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading your watchlist...</p>
        </div>
      )}

      {!loading && watchlist.length === 0 && (
        <div className="empty-state-large">
          <Film size={56} className="empty-icon" />
          <h2>Your watchlist is empty</h2>
          <p>Search for movies and add them to get started.</p>
          <Link to="/" className="btn btn-primary">
            Discover Movies
          </Link>
        </div>
      )}

      {!loading && unrated.length > 0 && (
        <section className="watchlist-section">
          <h2 className="section-title">To Watch</h2>
          <div className="watchlist-list">
            {unrated.map(item => (
              <WatchlistCard
                key={item.id}
                item={item}
                onRate={handleRate}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </section>
      )}

      {!loading && rated.length > 0 && (
        <section className="watchlist-section">
          <h2 className="section-title">Watched & Rated</h2>
          <div className="watchlist-list">
            {rated.map(item => (
              <WatchlistCard
                key={item.id}
                item={item}
                onRate={handleRate}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </section>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
