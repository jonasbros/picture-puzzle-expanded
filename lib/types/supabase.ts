export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon_url: string | null
          id: string
          is_hidden: boolean | null
          name: string
          points: number | null
          requirements: Json
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          icon_url?: string | null
          id?: string
          is_hidden?: boolean | null
          name: string
          points?: number | null
          requirements: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon_url?: string | null
          id?: string
          is_hidden?: boolean | null
          name?: string
          points?: number | null
          requirements?: Json
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          puzzle_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          puzzle_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          puzzle_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_puzzle_id_fkey"
            columns: ["puzzle_id"]
            isOneToOne: false
            referencedRelation: "puzzles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_puzzles: {
        Row: {
          created_at: string
          id: string
          puzzle_date: string
          puzzle_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          puzzle_date: string
          puzzle_id: string
        }
        Update: {
          created_at?: string
          id?: string
          puzzle_date?: string
          puzzle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_puzzles_puzzle_id_fkey"
            columns: ["puzzle_id"]
            isOneToOne: false
            referencedRelation: "puzzles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_stats: {
        Row: {
          average_time_ms: number | null
          best_time_ms: number | null
          created_at: string
          id: string
          perfect_completions: number | null
          puzzles_attempted: number | null
          puzzles_completed: number | null
          stat_date: string
          streak_count: number | null
          total_time_ms: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_time_ms?: number | null
          best_time_ms?: number | null
          created_at?: string
          id?: string
          perfect_completions?: number | null
          puzzles_attempted?: number | null
          puzzles_completed?: number | null
          stat_date: string
          streak_count?: number | null
          total_time_ms?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_time_ms?: number | null
          best_time_ms?: number | null
          created_at?: string
          id?: string
          perfect_completions?: number | null
          puzzles_attempted?: number | null
          puzzles_completed?: number | null
          stat_date?: string
          streak_count?: number | null
          total_time_ms?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          recipient_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          recipient_id: string
          requester_id: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          recipient_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_requests_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          completion_percentage: number | null
          created_at: string
          deleted_at: string | null
          difficulty_level: string | null
          id: string
          is_finished: boolean
          mmr_after: number | null
          mmr_before: number | null
          mmr_change: number
          piece_positions: string
          puzzle_id: string
          time_spent_ms: number
          tournament_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string
          deleted_at?: string | null
          difficulty_level?: string | null
          id?: string
          is_finished?: boolean
          mmr_after?: number | null
          mmr_before?: number | null
          mmr_change?: number
          piece_positions: string
          puzzle_id: string
          time_spent_ms: number
          tournament_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string
          deleted_at?: string | null
          difficulty_level?: string | null
          id?: string
          is_finished?: boolean
          mmr_after?: number | null
          mmr_before?: number | null
          mmr_change?: number
          piece_positions?: string
          puzzle_id?: string
          time_spent_ms?: number
          tournament_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_puzzle_id_fkey"
            columns: ["puzzle_id"]
            isOneToOne: false
            referencedRelation: "puzzles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboards: {
        Row: {
          created_at: string
          deleted_at: string | null
          difficulty_level: string | null
          id: string
          mmr: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          difficulty_level?: string | null
          id?: string
          mmr: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          difficulty_level?: string | null
          id?: string
          mmr?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      local_leaderboards: {
        Row: {
          created_at: string
          difficulty_level: string | null
          id: string
          progress_percentage: number
          puzzle_id: string
          spent_time_ms: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty_level?: string | null
          id?: string
          progress_percentage: number
          puzzle_id: string
          spent_time_ms: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty_level?: string | null
          id?: string
          progress_percentage?: number
          puzzle_id?: string
          spent_time_ms?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_leaderboards_puzzle_id_fkey"
            columns: ["puzzle_id"]
            isOneToOne: false
            referencedRelation: "puzzles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_leaderboards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          data: Json | null
          expires_at: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      puzzle_analytics: {
        Row: {
          average_completion_time_ms: number | null
          completion_rate: number | null
          created_at: string
          difficulty_level: string | null
          difficulty_rating: number | null
          fastest_completion_ms: number | null
          id: string
          last_updated_at: string
          puzzle_id: string
          slowest_completion_ms: number | null
          total_attempts: number | null
          total_completions: number | null
          total_players: number | null
          total_time_ms: number | null
        }
        Insert: {
          average_completion_time_ms?: number | null
          completion_rate?: number | null
          created_at?: string
          difficulty_level?: string | null
          difficulty_rating?: number | null
          fastest_completion_ms?: number | null
          id?: string
          last_updated_at?: string
          puzzle_id: string
          slowest_completion_ms?: number | null
          total_attempts?: number | null
          total_completions?: number | null
          total_players?: number | null
          total_time_ms?: number | null
        }
        Update: {
          average_completion_time_ms?: number | null
          completion_rate?: number | null
          created_at?: string
          difficulty_level?: string | null
          difficulty_rating?: number | null
          fastest_completion_ms?: number | null
          id?: string
          last_updated_at?: string
          puzzle_id?: string
          slowest_completion_ms?: number | null
          total_attempts?: number | null
          total_completions?: number | null
          total_players?: number | null
          total_time_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "puzzle_analytics_puzzle_id_fkey"
            columns: ["puzzle_id"]
            isOneToOne: false
            referencedRelation: "puzzles"
            referencedColumns: ["id"]
          },
        ]
      }
      puzzle_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          puzzle_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          puzzle_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          puzzle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "puzzle_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "puzzle_categories_puzzle_id_fkey"
            columns: ["puzzle_id"]
            isOneToOne: false
            referencedRelation: "puzzles"
            referencedColumns: ["id"]
          },
        ]
      }
      puzzles: {
        Row: {
          attribution: Json | null
          created_at: string
          deleted_at: string | null
          id: string
          slug: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          attribution?: Json | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          slug: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          attribution?: Json | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          slug?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          permissions: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          permissions?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          permissions?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      subscription_tiers: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          price: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          price: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          price?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          tier_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          tier_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          tier_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_invites: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invitee_id: string
          inviter_id: string
          message: string | null
          status: string
          tournament_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          invitee_id: string
          inviter_id: string
          message?: string | null
          status: string
          tournament_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invitee_id?: string
          inviter_id?: string
          message?: string | null
          status?: string
          tournament_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_invites_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_invites_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_invites_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          total_mmr_gained: number | null
          tournament_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          total_mmr_gained?: number | null
          tournament_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          total_mmr_gained?: number | null
          tournament_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_puzzles: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          puzzle_id: string
          tournament_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          puzzle_id: string
          tournament_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          puzzle_id?: string
          tournament_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_puzzles_puzzle_id_fkey"
            columns: ["puzzle_id"]
            isOneToOne: false
            referencedRelation: "puzzles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_puzzles_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          bracket: Json | null
          closes_at: string | null
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          is_open: boolean
          is_subscribed_only: boolean
          max_participant_mmr: number | null
          max_player_count: number
          min_participant_mmr: number | null
          name: string
          organizer_id: string
          updated_at: string
        }
        Insert: {
          bracket?: Json | null
          closes_at?: string | null
          created_at?: string
          deleted_at?: string | null
          format: string
          id?: string
          is_open?: boolean
          is_subscribed_only?: boolean
          max_participant_mmr?: number | null
          max_player_count: number
          min_participant_mmr?: number | null
          name: string
          organizer_id: string
          updated_at?: string
        }
        Update: {
          bracket?: Json | null
          closes_at?: string | null
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          is_open?: boolean
          is_subscribed_only?: boolean
          max_participant_mmr?: number | null
          max_player_count?: number
          min_participant_mmr?: number | null
          name?: string
          organizer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          progress: Json | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          progress?: Json | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          progress?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          role_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          role_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          role_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          browser_info: Json | null
          country_code: string | null
          created_at: string
          device_type: string | null
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_activity: string
          puzzles_attempted: number | null
          puzzles_completed: number | null
          referrer_url: string | null
          session_end: string | null
          session_id: string
          session_start: string
          total_time_active_ms: number | null
          total_time_idle_ms: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          browser_info?: Json | null
          country_code?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string
          puzzles_attempted?: number | null
          puzzles_completed?: number | null
          referrer_url?: string | null
          session_end?: string | null
          session_id: string
          session_start?: string
          total_time_active_ms?: number | null
          total_time_idle_ms?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          browser_info?: Json | null
          country_code?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string
          puzzles_attempted?: number | null
          puzzles_completed?: number | null
          referrer_url?: string | null
          session_end?: string | null
          session_id?: string
          session_start?: string
          total_time_active_ms?: number | null
          total_time_idle_ms?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_statistics: {
        Row: {
          average_completion_time_ms: number | null
          created_at: string
          current_streak: number | null
          id: string
          longest_streak: number | null
          total_puzzles_completed: number | null
          total_time_played_ms: number | null
          total_tournaments_participated: number | null
          total_tournaments_won: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_completion_time_ms?: number | null
          created_at?: string
          current_streak?: number | null
          id?: string
          longest_streak?: number | null
          total_puzzles_completed?: number | null
          total_time_played_ms?: number | null
          total_tournaments_participated?: number | null
          total_tournaments_won?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_completion_time_ms?: number | null
          created_at?: string
          current_streak?: number | null
          id?: string
          longest_streak?: number | null
          total_puzzles_completed?: number | null
          total_time_played_ms?: number | null
          total_tournaments_participated?: number | null
          total_tournaments_won?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_statistics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          is_guest: boolean
          last_login: string | null
          preferences: Json | null
          updated_at: string
          username: string
          username_duplicate: number
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_guest?: boolean
          last_login?: string | null
          preferences?: Json | null
          updated_at?: string
          username: string
          username_duplicate?: number
        }
        Update: {
          avatar?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_guest?: boolean
          last_login?: string | null
          preferences?: Json | null
          updated_at?: string
          username?: string
          username_duplicate?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_difficulty_ratings: { Args: never; Returns: undefined }
      cleanup_expired_notifications: { Args: never; Returns: number }
      cleanup_inactive_sessions: { Args: never; Returns: number }
      create_notification: {
        Args: {
          p_action_url?: string
          p_data?: Json
          p_expires_at?: string
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      create_tournament_invite: {
        Args: {
          p_invitee_id: string
          p_message?: string
          p_tournament_id: string
        }
        Returns: string
      }
      end_user_session: {
        Args: { p_session_id: string; p_user_id: string }
        Returns: boolean
      }
      expire_tournament_invites: { Args: never; Returns: number }
      generate_puzzle_slug: {
        Args: { id: string; title: string }
        Returns: string
      }
      get_leaderboard_by_difficulty: {
        Args: { p_difficulty_level?: string; p_limit?: number }
        Returns: {
          created_at: string
          mmr: number
          rank_position: number
          user_id: string
          username: string
        }[]
      }
      get_next_username_duplicate: {
        Args: { p_username: string }
        Returns: number
      }
      get_recommended_puzzles: {
        Args: {
          p_difficulty_preference?: string
          p_limit?: number
          p_user_id: string
        }
        Returns: {
          average_time_ms: number
          completion_rate: number
          difficulty_level: string
          difficulty_rating: number
          puzzle_id: string
        }[]
      }
      get_session_analytics: {
        Args: { p_days_back?: number; p_user_id?: string }
        Returns: {
          avg_session_duration_ms: number
          completion_rate: number
          most_active_device: string
          most_active_hour: number
          puzzles_per_session: number
          total_sessions: number
          total_time_spent_ms: number
        }[]
      }
      get_user_rank_by_difficulty: {
        Args: { p_difficulty_level?: string; p_user_id: string }
        Returns: {
          mmr: number
          rank_position: number
          total_players: number
        }[]
      }
      mark_notifications_read: {
        Args: { notification_ids: string[] }
        Returns: number
      }
      update_session_activity: {
        Args: {
          p_puzzle_attempted?: boolean
          p_puzzle_completed?: boolean
          p_session_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      update_user_streaks: { Args: never; Returns: undefined }
      upsert_user_session: {
        Args: {
          p_browser_info?: Json
          p_country_code?: string
          p_device_type?: string
          p_ip_address?: unknown
          p_referrer_url?: string
          p_session_id: string
          p_user_id: string
        }
        Returns: string
      }
      user_has_role: { Args: { role_name: string }; Returns: boolean }
      user_is_admin_or_mod: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

