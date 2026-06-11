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
          last_read_at: string;
        };
        Insert: {
          room_id: string;
          user_id: string;
          joined_at?: string;
          last_read_at?: string;
        };
        Update: {
          room_id?: string;
          user_id?: string;
          joined_at?: string;
          last_read_at?: string;
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
          content: string | null;
          created_at: string;
          type: 'text' | 'image';
          storage_path: string | null;
          file_name: string | null;
          file_size: number | null;
          mime_type: string | null;
        };
        Insert: {
          id?: string;
          room_id: string;
          sender_id: string;
          content?: string | null;
          created_at?: string;
          type?: 'text' | 'image';
          storage_path?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
        };
        Update: {
          id?: string;
          room_id?: string;
          sender_id?: string;
          content?: string | null;
          created_at?: string;
          type?: 'text' | 'image';
          storage_path?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
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
          display_name: string;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
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
      send_image_message: {
        Args: {
          p_room_id: string;
          p_storage_path: string;
          p_file_name?: string | null;
          p_file_size?: number | null;
          p_mime_type?: string | null;
        };
        Returns: Database['public']['Tables']['messages']['Row'];
      };
      mark_room_read: {
        Args: { p_room_id: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
}
