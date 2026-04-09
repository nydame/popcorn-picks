export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TMDBSearchResponse {
  results: TMDBMovie[];
  total_results: number;
  total_pages: number;
  page: number;
}
