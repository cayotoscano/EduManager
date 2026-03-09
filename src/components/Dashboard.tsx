import { format } from 'date-fns';
import { useAppStore } from '../store/useAppStore';
import { DollarSign, Users, Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import { useEffect } from 'react';

const Dashboard = () => {
  const { students, sessions, payments, fetchStudents, fetchSessions, fetchPayments } = useAppStore();

  useEffect(() => {
    fetchStudents();
    fetchSessions();
    fetchPayments();
  }, [fetchStudents, fetchSessions, fetchPayments]);

  const activeStudents = students.filter(s => s.status === 'ativo').length;
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const sessionsToday = sessions
    .filter(s => s.date === todayStr)
    .sort((a, b) => (a.start_time || '00:00').localeCompare(b.start_time || '00:00'));
  
  const sessionsCompletedToday = sessionsToday.filter(s => s.status === 'concluída').length;
  
  const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const studentsWithLowCredits = students.filter(s => s.credits <= 1 && s.status === 'ativo');

  const stats = [
    { name: 'Receita Total', value: `R$ ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-green-500' },
    { name: 'Alunos Ativos', value: activeStudents.toString(), icon: Users, color: 'bg-blue-500' },
    { name: 'Aulas Hoje', value: sessionsToday.length.toString(), icon: CalendarIcon, color: 'bg-indigo-500' },
    { name: 'Concluídas Hoje', value: sessionsCompletedToday.toString(), icon: CheckCircle, color: 'bg-teal-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className={`h-6 w-6 text-white p-1.5 rounded-md ${item.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">{item.name}</dt>
                    <dd className="text-lg font-semibold text-slate-900">{item.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aulas de Hoje */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-indigo-500" />
            Aulas Hoje ({format(new Date(), "dd 'de' MMMM", { locale: ptBR })})
          </h2>
          {sessionsToday.length > 0 ? (
            <ul className="space-y-4">
              {sessionsToday.map(session => (
                <li key={session.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center space-x-4">
                    <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md font-bold text-sm">
                      {session.start_time.substring(0, 5)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{session.title}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {session.duration_minutes} min • <span className="capitalize">{session.status}</span>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">Nenhuma aula marcada para hoje.</p>
          )}
        </div>

        {/* Alunos com Poucos Créditos */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-orange-500" />
            Alunos (Poucos Créditos)
          </h2>
          {studentsWithLowCredits.length > 0 ? (
            <ul className="space-y-4">
              {studentsWithLowCredits.map(student => (
                <li key={student.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">{student.name}</p>
                    <p className="text-sm text-slate-500">{student.phone}</p>
                  </div>
                  <div className={`text-sm font-bold px-2 py-1 rounded-full ${student.credits <= 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {student.credits} aulas
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">Nenhum aluno com créditos baixos.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;