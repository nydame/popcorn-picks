import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { FavoriteItem } from '../types/database';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setFavorites(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = async (movie: {
    movie_id: string;
    title: string;
    poster?: string;
    year?: string;
    overview?: string;
  }): Promise<{ error?: string }> => {
    if (!user) return { error: 'Not authenticated' };

    const alreadyIn = favorites.some(f => f.movie_id === movie.movie_id);
    if (alreadyIn) return { error: 'Already in favorites' };

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        movie_id: movie.movie_id,
        title: movie.title,
        poster: movie.poster ?? '',
        year: movie.year ?? '',
        overview: movie.overview ?? '',
      })
      .select()
      .single();

    if (error) return { error: error.message };
    if (data) setFavorites(prev => [data, ...prev]);
    return {};
  };

  const removeFavorite = async (id: string): Promise<{ error?: string }> => {
    const { error } = await supabase.from('favorites').delete().eq('id', id);
    if (error) return { error: error.message };
    setFavorites(prev => prev.filter(f => f.id !== id));
    return {};
  };

  const isInFavorites = (movieId: string) =>
    favorites.some(f => f.movie_id === movieId);

  return { favorites, loading, addFavorite, removeFavorite, isInFavorites, refetch: fetchFavorites };
}
