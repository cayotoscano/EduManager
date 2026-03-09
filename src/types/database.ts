export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      payments: {
        Row: {
          amount: number
          created_at: string | null
          credits_added: number
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          student_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          credits_added?: number
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          student_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          credits_added?: number
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          student_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      session_students: {
        Row: {
          credited: boolean
          id: string
          session_id: string
          student_id: string
        }
        Insert: {
          credited?: boolean
          id?: string
          session_id: string
          student_id: string
        }
        Update: {
          credited?: boolean
          id?: string
          session_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_students_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          }
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          duration_minutes: number
          id: string
          start_time: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          duration_minutes?: number
          id?: string
          start_time?: string
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          start_time?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      students: {
        Row: {
          created_at: string | null
          credits: number
          default_duration: number
          default_price: number
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits?: number
          default_duration?: number
          default_price?: number
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits?: number
          default_duration?: number
          default_price?: number
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      dashboard_stats: {
        Row: {
          revenue_this_month: number | null
          sessions_this_month: number | null
          total_credits: number | null
          total_students: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      complete_session: {
        Args: { p_session_id: string }
        Returns: {
          created_at: string | null
          date: string
          description: string | null
          duration_minutes: number
          id: string
          start_time: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }[]
      }
      register_payment: {
        Args: {
          p_amount: number
          p_credits_added: number
          p_notes?: string
          p_payment_date?: string
          p_payment_method: string
          p_student_id: string
          p_user_id: string
        }
        Returns: {
          amount: number
          created_at: string | null
          credits_added: number
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          student_id: string
          user_id: string
        }[]
      }
      seed_dev_data: { Args: { p_user_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
