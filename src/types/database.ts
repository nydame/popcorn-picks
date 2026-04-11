export interface Database {
  public: {
    Tables: {
      favorites: {
        Row: {
          id: string;
          user_id: string;
          movie_id: string;
          title: string;
          poster: string;
          year: string;
          overview: string;
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
          created_at?: string;
        };
      };
    };
  };
}

export type FavoriteItem = Database['public']['Tables']['favorites']['Row'];
export type WatchlistItem = FavoriteItem;
