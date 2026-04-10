import { useState } from 'react';
import { Heart, Trash2, Film, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { ToastContainer, createToast, type ToastMessage } from '../components/UI/Toast';
import type { FavoriteItem } from '../types/database';

export default function FavoritesPage() {
  const { favorites, loading, removeFavorite } = useFavorites();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [selectedFav, setSelectedFav] = useState<FavoriteItem | null>(null);

  const addToast = (type: 'success' | 'error', message: string) => {
    setToasts(prev => [...prev, createToast(type, message)]);
  };

  const handleRemove = async (fav: FavoriteItem) => {
    setRemovingId(fav.id);
    const { error } = await removeFavorite(fav.id);
    if (error) {
      addToast('error', 'Failed to remove. Please try again.');
    } else {
      addToast('success', `"${fav.title}" removed from Favorites.`);
      if (selectedFav?.id === fav.id) setSelectedFav(null);
    }
    setRemovingId(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Heart size={28} />
          My Favorites
        </h1>
        <p className="page-subtitle">
          {favorites.length > 0
            ? `${favorites.length} movie${favorites.length === 1 ? '' : 's'} saved`
            : 'Movies you love, all in one place'}
        </p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading favorites...</span>
        </div>
      ) : favorites.length === 0 ? (
        <div className="empty-state-large">
          <div className="empty-icon"><Heart size={48} /></div>
          <h2>No favorites yet</h2>
          <p>Search for movies and add them to your favorites.</p>
          <Link to="/search" className="btn btn-primary" style={{ marginTop: 8 }}>
            <Search size={16} /> Browse Movies
          </Link>
        </div>
      ) : (
        <>
          {favorites.length >= 3 && (
            <div style={{ marginBottom: 28 }}>
              <Link to="/recommendations" className="btn btn-primary btn-lg">
                <Sparkles size={18} /> Get AI Recommendations
              </Link>
            </div>
          )}
          <div className="favorites-grid">
            {favorites.map(fav => (
              <div
                key={fav.id}
                className="favorite-card"
                onClick={() => setSelectedFav(selectedFav?.id === fav.id ? null : fav)}
              >
                <div className="movie-poster-wrap">
                  {fav.poster ? (
                    <img src={fav.poster} alt={fav.title} className="movie-poster" loading="lazy" />
                  ) : (
                    <div className="movie-poster-placeholder">
                      <Film size={28} />
                      <span>No Image</span>
                    </div>
                  )}
                  <div className="favorite-overlay">
                    <button
                      className="remove-fav-btn"
                      onClick={e => { e.stopPropagation(); handleRemove(fav); }}
                      disabled={removingId === fav.id}
                      aria-label="Remove from favorites"
                    >
                      <Trash2 size={13} />
                      {removingId === fav.id ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{fav.title}</h3>
                  {fav.year && <span className="movie-year">{fav.year}</span>}
                </div>
              </div>
            ))}
          </div>

          {selectedFav && selectedFav.overview && (
            <div
              style={{
                marginTop: 32,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 24px',
                display: 'flex',
                gap: 16,
              }}
            >
              {selectedFav.poster && (
                <img
                  src={selectedFav.poster}
                  alt={selectedFav.title}
                  style={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
                />
              )}
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                  {selectedFav.title} {selectedFav.year && <span style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>({selectedFav.year})</span>}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{selectedFav.overview}</p>
              </div>
            </div>
          )}
        </>
      )}

      <ToastContainer toasts={toasts} onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
}
