import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { FavoriteItem } from '../types/database';

function getSessionId(): string {
  let id = sessionStorage.getItem('pp-session-id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('pp-session-id', id);
  }
  return id;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const sessionId = getSessionId();

  const fetchFavorites = useCallback(async () => {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setFavorites(data);
    }
    setLoading(false);
  }, [sessionId]);

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
    const alreadyIn = favorites.some(f => f.movie_id === movie.movie_id);
    if (alreadyIn) return { error: 'Already in favorites' };

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        session_id: sessionId,
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
