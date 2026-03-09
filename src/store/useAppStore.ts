import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type Student = Database['public']['Tables']['students']['Row'];
type Session = Database['public']['Tables']['sessions']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];

interface AppState {
  students: Student[];
  sessions: Session[];
  payments: Payment[];
  loadingStatus: {
    students: boolean;
    sessions: boolean;
    payments: boolean;
  };
  error: string | null;

  fetchStudents: () => Promise<void>;
  fetchSessions: () => Promise<void>;
  fetchPayments: () => Promise<void>;

  addStudent: (student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  addSession: (session: Omit<Session, 'id' | 'created_at' | 'updated_at'>, studentIds: string[]) => Promise<void>;
  updateSession: (id: string, data: Partial<Session>, studentIds?: string[]) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  completeSession: (id: string) => Promise<void>;
  fetchSessionStudents: (sessionId: string) => Promise<string[]>;

  addPayment: (payment: Omit<Payment, 'id' | 'created_at'>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  reset: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  students: [],
  sessions: [],
  payments: [],
  loadingStatus: {
    students: false,
    sessions: false,
    payments: false,
  },
  error: null,

  fetchStudents: async () => {
    set((state) => ({ loadingStatus: { ...state.loadingStatus, students: true }, error: null }));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return set((state) => ({ loadingStatus: { ...state.loadingStatus, students: false } }));

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) set({ error: error.message });
    else set({ students: data || [] });
    
    set((state) => ({ loadingStatus: { ...state.loadingStatus, students: false } }));
  },

  fetchSessions: async () => {
    set((state) => ({ loadingStatus: { ...state.loadingStatus, sessions: true }, error: null }));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return set((state) => ({ loadingStatus: { ...state.loadingStatus, sessions: false } }));

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (error) set({ error: error.message });
    else set({ sessions: data || [] });
    
    set((state) => ({ loadingStatus: { ...state.loadingStatus, sessions: false } }));
  },

  fetchPayments: async () => {
    set((state) => ({ loadingStatus: { ...state.loadingStatus, payments: true }, error: null }));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return set((state) => ({ loadingStatus: { ...state.loadingStatus, payments: false } }));

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('payment_date', { ascending: false });

    if (error) set({ error: error.message });
    else set({ payments: data || [] });
    
    set((state) => ({ loadingStatus: { ...state.loadingStatus, payments: false } }));
  },

  addStudent: async (student) => {
    set({ error: null });
    const { data, error } = await supabase.from('students').insert(student).select().single();
    if (error) set({ error: error.message });
    else if (data) set((state) => ({ students: [data, ...state.students] }));
  },

  updateStudent: async (id, data) => {
    set({ error: null });
    const { data: updated, error } = await supabase.from('students').update(data).eq('id', id).select().single();
    if (error) set({ error: error.message });
    else if (updated) set((state) => ({ students: state.students.map((s) => s.id === id ? updated : s) }));
  },

  deleteStudent: async (id) => {
    set({ error: null });
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) set({ error: error.message });
    else set((state) => ({ students: state.students.filter((s) => s.id !== id) }));
  },

  addSession: async (session, studentIds) => {
    set({ error: null });
    const { data, error } = await supabase.from('sessions').insert(session).select().single();
    if (error) {
      set({ error: error.message });
      return;
    }
    
    if (data && studentIds.length > 0) {
      const sessionStudents = studentIds.map(studentId => ({
        session_id: data.id,
        student_id: studentId,
      }));
      const { error: ssError } = await supabase.from('session_students').insert(sessionStudents);
      if (ssError) set({ error: ssError.message });
    }
    
    if (data) set((state) => ({ sessions: [...state.sessions, data] }));
  },

  updateSession: async (id, data, studentIds) => {
    set({ error: null });
    const { data: updated, error } = await supabase.from('sessions').update(data).eq('id', id).select().single();
    
    if (error) {
      set({ error: error.message });
      return;
    }

    if (updated && studentIds) {
      // Manage session_students table for linked students in edit flow
      await supabase.from('session_students').delete().eq('session_id', id);
      
      if (studentIds.length > 0) {
        const sessionStudents = studentIds.map(studentId => ({
          session_id: id,
          student_id: studentId,
        }));
        await supabase.from('session_students').insert(sessionStudents);
      }
    }

    if (updated) set((state) => ({ sessions: state.sessions.map((s) => s.id === id ? updated : s) }));
  },

  deleteSession: async (id) => {
    set({ error: null });
    const { error } = await supabase.from('sessions').delete().eq('id', id);
    if (error) set({ error: error.message });
    else set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) }));
  },

  completeSession: async (id) => {
    set({ error: null });
    const { error } = await supabase.rpc('complete_session', { p_session_id: id });
    if (error) set({ error: error.message });
    else {
      get().fetchStudents();
      get().fetchSessions();
    }
  },

  fetchSessionStudents: async (sessionId) => {
    const { data, error } = await supabase
      .from('session_students')
      .select('student_id')
      .eq('session_id', sessionId);
    
    if (error) {
      set({ error: error.message });
      return [];
    }
    
    return data.map(row => row.student_id);
  },

  addPayment: async (payment) => {
    set({ error: null });
    const { error } = await supabase.rpc('register_payment', {
      p_user_id: payment.user_id,
      p_student_id: payment.student_id,
      p_amount: payment.amount,
      p_credits_added: payment.credits_added,
      p_payment_method: payment.payment_method || 'pix',
      p_notes: payment.notes || undefined,
      p_payment_date: payment.payment_date || undefined
    });
    if (error) set({ error: error.message });
    else {
      get().fetchStudents();
      get().fetchPayments();
    }
  },

  deletePayment: async (id) => {
    set({ error: null });
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) set({ error: error.message });
    else set((state) => ({ payments: state.payments.filter((p) => p.id !== id) }));
  },

  reset: () => {
    set({
      students: [],
      sessions: [],
      payments: [],
      loadingStatus: {
        students: false,
        sessions: false,
        payments: false,
      },
      error: null,
    });
  },
}));