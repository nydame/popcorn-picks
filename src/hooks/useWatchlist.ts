import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { WatchlistItem } from '../types/database';
import { useAuth } from '../contexts/AuthContext';

export function useWatchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWatchlist = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setWatchlist(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = async (movie: {
    movie_id: string;
    title: string;
    poster: string;
    year: string;
    overview: string;
  }) => {
    if (!user) return { error: 'Not authenticated' };

    const existing = watchlist.find(w => w.movie_id === movie.movie_id);
    if (existing) return { error: 'Already in watchlist' };

    const { data, error } = await supabase
      .from('watchlist')
      .insert({ ...movie, user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      setWatchlist(prev => [data, ...prev]);
    }
    return { error: error?.message ?? null };
  };

  const updateRating = async (id: string, rating: number) => {
    const { error } = await supabase
      .from('watchlist')
      .update({ rating })
      .eq('id', id);

    if (!error) {
      setWatchlist(prev =>
        prev.map(item => (item.id === id ? { ...item, rating } : item))
      );
    }
    return { error: error?.message ?? null };
  };

  const removeFromWatchlist = async (id: string) => {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('id', id);

    if (!error) {
      setWatchlist(prev => prev.filter(item => item.id !== id));
    }
    return { error: error?.message ?? null };
  };

  const isInWatchlist = (movieId: string) =>
    watchlist.some(w => w.movie_id === movieId);

  return {
    watchlist,
    loading,
    addToWatchlist,
    updateRating,
    removeFromWatchlist,
    isInWatchlist,
    refetch: fetchWatchlist,
  };
}
