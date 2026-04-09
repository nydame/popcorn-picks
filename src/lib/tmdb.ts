import type { TMDBMovie, TMDBSearchResponse } from '../types/tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

export const getPosterUrl = (path: string | null) =>
  path ? `${TMDB_IMAGE_BASE}${path}` : '';

export async function searchMovies(
  query: string,
  apiKey: string
): Promise<TMDBMovie[]> {
  if (!query.trim()) return [];
  const url = `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to search movies');
  const data: TMDBSearchResponse = await res.json();
  return data.results;
}

export async function getPopularMovies(apiKey: string): Promise<TMDBMovie[]> {
  const url = `${TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&language=en-US&page=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch popular movies');
  const data: TMDBSearchResponse = await res.json();
  return data.results;
}
