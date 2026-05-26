// Replace with generated types from: npx supabase gen types typescript --project-id <id>
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RoomType = 'direct' | 'group';

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          name: string | null;
          type: RoomType;
          avatar_url: string | null;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          type?: RoomType;
          avatar_url?: string | null;
          last_message_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          type?: RoomType;
          avatar_url?: string | null;
          last_message_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      room_members: {
        Row: {
          room_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          room_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          room_id?: string;
          user_id?: string;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'room_members_room_id_fkey';
            columns: ['room_id'];
            referencedRelation: 'rooms';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          room_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          sender_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_room_id_fkey';
            columns: ['room_id'];
            referencedRelation: 'rooms';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_or_create_direct_room: {
        Args: { other_user_id: string };
        Returns: string;
      };
      send_message: {
        Args: { p_room_id: string; p_content: string };
        Returns: Database['public']['Tables']['messages']['Row'];
      };
    };
    Enums: Record<string, never>;
  };
}
