import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { ChevronLeft, ChevronRight, Plus, X, Trash2, CheckCircle, Calendar as CalendarIcon, Clock, Users, FileText } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ConfirmModal from './ConfirmModal';

type Session = Database['public']['Tables']['sessions']['Row'];

interface SessionFormData {
  title: string;
  date: string;
  start_time: string;
  description: string;
  duration_minutes: number;
  status: string;
  studentIds: string[];
}

const Calendar = () => {
  const { students, sessions, addSession, updateSession, deleteSession, completeSession, fetchStudents, fetchSessions, fetchSessionStudents } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);
  const [sessionToComplete, setSessionToComplete] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<SessionFormData>({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    description: '',
    duration_minutes: 60,
    status: 'agendada',
    studentIds: [],
  });

  useEffect(() => {
    fetchStudents();
    fetchSessions();
  }, [fetchStudents, fetchSessions]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const toggleStudent = (studentId: string) => {
    setFormData(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter(id => id !== studentId)
        : [...prev.studentIds, studentId],
    }));
  };

  const openModal = async (date: Date, session?: Session) => {
    if (session) {
      setEditingSession(session);
      const linkedStudentIds = await fetchSessionStudents(session.id);
      setFormData({
        title: session.title,
        date: session.date,
        start_time: session.start_time.substring(0, 5),
        description: session.description || '',
        duration_minutes: session.duration_minutes,
        status: session.status,
        studentIds: linkedStudentIds,
      });
    } else {
      setEditingSession(null);
      setFormData({
        title: '',
        date: format(date, 'yyyy-MM-dd'),
        start_time: '09:00',
        description: '',
        duration_minutes: 60,
        status: 'agendada',
        studentIds: [],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSession(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalTitle = formData.title.trim();
    if (!finalTitle && formData.studentIds.length > 0) {
      finalTitle = students
        .filter(s => formData.studentIds.includes(s.id))
        .map(s => s.name.split(' ')[0])
        .join(', ');
    }

    if (editingSession) {
      if (formData.status === 'concluída' && editingSession.status !== 'concluída') {
        await completeSession(editingSession.id);
      } else {
        await updateSession(editingSession.id, {
          title: finalTitle || 'Sem título',
          date: formData.date,
          start_time: formData.start_time,
          description: formData.description || null,
          duration_minutes: formData.duration_minutes,
          status: formData.status,
        }, formData.studentIds);
      }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await addSession(
        {
          title: finalTitle || 'Sem título',
          date: formData.date,
          start_time: formData.start_time,
          description: formData.description || null,
          duration_minutes: formData.duration_minutes,
          status: formData.status === 'concluída' ? 'agendada' : formData.status,
          user_id: user.id,
        },
        formData.studentIds
      );

      if (formData.status === 'concluída') {
        await fetchSessions();
        const newSession = useAppStore.getState().sessions.find(
          s => s.title === (finalTitle || 'Sem título') && s.date === formData.date && s.status === 'agendada'
        );
        if (newSession) {
          await completeSession(newSession.id);
        }
      }
    }
    closeModal();
  };

  const handleDeleteClick = (id: string) => {
    setSessionToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (sessionToDelete) {
      await deleteSession(sessionToDelete);
      setSessionToDelete(null);
      closeModal();
    }
  };

  const handleCompleteClick = (id: string) => {
    setSessionToComplete(id);
    setIsCompleteConfirmOpen(true);
  };

  const confirmComplete = async () => {
    if (sessionToComplete) {
      await completeSession(sessionToComplete);
      setSessionToComplete(null);
      closeModal();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Agenda</h1>
        <button
          onClick={() => openModal(new Date())}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Aula
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <div className="flex items-center space-x-1">
            <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())} 
              className="px-4 py-1.5 text-sm font-bold border border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-200 text-slate-700 rounded-lg transition-all shadow-sm mx-1"
            >
              Hoje
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/30">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="py-2.5 text-center text-xs font-bold text-slate-500 uppercase tracking-widest outline-none">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-fr">
          {monthDays.map((day) => {
            const daySessions = sessions
              .filter(s => s.date === format(day, 'yyyy-MM-dd'));
            
            return (
              <div
                key={day.toString()}
                onClick={() => openModal(day)}
                className={`min-h-[130px] p-2 border-b border-r border-slate-100 cursor-pointer hover:bg-slate-50/80 transition-all group
                  ${!isSameMonth(day, currentDate) ? 'bg-slate-50/50 grayscale' : 'bg-white'}
                  ${isToday(day) ? 'ring-1 ring-inset ring-indigo-200 bg-indigo-50/20' : ''}
                `}
              >
                <div className={`text-right text-xs mb-1.5 p-1 rounded-md transition-all ${
                  isToday(day) 
                    ? 'font-black text-indigo-700 bg-indigo-100 inline-block float-right min-w-[24px] text-center' 
                    : 'text-slate-400 font-bold group-hover:text-slate-600'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1 clear-right">
                  {daySessions.map(session => (
                    <div
                      key={session.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(day, session);
                      }}
                      className={`text-[10px] sm:text-xs p-1.5 rounded-lg border shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] font-semibold truncate ${
                        session.status === 'concluída' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                        session.status === 'cancelada' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                        'bg-indigo-50 border-indigo-100 text-indigo-800'
                      }`}
                      title={`${session.start_time.substring(0, 5)} - ${session.title}`}
                    >
                      <span className="opacity-60 mr-1">{session.start_time.substring(0, 5)}</span>
                      {session.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Aula"
        message="Tem certeza que deseja excluir esta aula? Esta ação irá remover todos os vínculos com os alunos."
      />

      <ConfirmModal
        isOpen={isCompleteConfirmOpen}
        onClose={() => setIsCompleteConfirmOpen(false)}
        onConfirm={confirmComplete}
        variant="info"
        title="Concluir Aula"
        message="Deseja marcar esta aula como concluída? Isso debitará automaticamente 1 crédito de cada aluno vinculado."
        confirmText="Concluir Aula"
      />

      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleBackdropClick}
        >
          <div 
            ref={modalRef}
            className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingSession ? 'Editar Aula' : 'Agendar Aula'}
                </h2>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-semibold text-slate-700 mb-1.5">
                    <FileText className="w-4 h-4 mr-2 text-slate-400" />
                    Título
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    placeholder="Título (opcional - será o nome dos alunos se vazio)"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-slate-700 mb-1.5">
                    <Users className="w-4 h-4 mr-2 text-slate-400" />
                    Alunos ({formData.studentIds.length} selecionados)
                  </label>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-50/30">
                    <div className="max-h-[180px] overflow-y-auto p-1 divide-y divide-slate-100">
                      {students.filter(s => s.status === 'ativo' || formData.studentIds.includes(s.id)).map(student => (
                        <label
                          key={student.id}
                          className={`flex items-center px-4 py-2.5 cursor-pointer hover:bg-white transition-all ${
                            formData.studentIds.includes(student.id) ? 'bg-white shadow-sm ring-1 ring-inset ring-indigo-50' : ''
                          }`}
                        >
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.studentIds.includes(student.id)}
                              onChange={() => toggleStudent(student.id)}
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </div>
                          <span className="ml-3 flex-1 text-sm font-medium text-slate-700">{student.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
                            student.credits > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {student.credits} aulas
                          </span>
                        </label>
                      ))}
                      {students.length === 0 && (
                        <p className="text-sm text-slate-400 p-4 text-center italic">Nenhum aluno ativo cadastrado.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-1.5">
                      <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" />
                      Data
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-1.5">
                      <Clock className="w-4 h-4 mr-2 text-slate-400" />
                      Início
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-slate-700 mb-1.5">
                    <Clock className="w-4 h-4 mr-2 text-slate-400" />
                    Duração (min)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-slate-700 mb-1.5">
                    <CheckCircle className="w-4 h-4 mr-2 text-slate-400" />
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white font-medium"
                  >
                    <option value="agendada">📅 Agendada</option>
                    <option value="concluída">✅ Concluída (Debita crédito)</option>
                    <option value="cancelada">❌ Cancelada</option>
                  </select>
                  {formData.status === 'concluída' && (
                    <div className="mt-2 bg-rose-50 p-2.5 rounded-lg border border-rose-100 flex items-start">
                      <div className="text-amber-600 mr-2 font-bold">⚠</div>
                      <p className="text-[11px] text-rose-700 font-medium">
                        Marcar como concluída irá debitar 1 crédito de cada aluno selecionado. Esta ação é processada imediatamente.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-slate-700 mb-1.5">
                    <FileText className="w-4 h-4 mr-2 text-slate-400" />
                    Observações
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
                    placeholder="Link do Zoom/Meet ou anotações..."
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                <div className="flex space-x-2">
                  {editingSession && editingSession.status !== 'concluída' && (
                    <button
                      type="button"
                      onClick={() => handleCompleteClick(editingSession.id)}
                      className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all text-sm font-bold shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      Concluir
                    </button>
                  )}
                  {editingSession && (
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(editingSession.id)}
                      className="flex items-center px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all text-sm font-semibold"
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Excluir
                    </button>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-bold shadow-sm"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;