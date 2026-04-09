export interface Database {
  public: {
    Tables: {
      watchlist: {
        Row: {
          id: string;
          user_id: string;
          movie_id: string;
          title: string;
          poster: string;
          year: string;
          overview: string;
          rating: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          movie_id: string;
          title: string;
          poster?: string;
          year?: string;
          overview?: string;
          rating?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          movie_id?: string;
          title?: string;
          poster?: string;
          year?: string;
          overview?: string;
          rating?: number | null;
          created_at?: string;
        };
      };
    };
  };
}

export type WatchlistItem = Database['public']['Tables']['watchlist']['Row'];
