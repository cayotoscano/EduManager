import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { Plus, X, DollarSign, TrendingUp, Download, CheckCircle, CreditCard, Wallet, Banknote, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmModal from './ConfirmModal';

interface PaymentFormData {
  student_id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  notes: string;
  credits_added: number;
}

const Financial = () => {
  const { students, payments, addPayment, deletePayment, fetchStudents, fetchPayments } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<PaymentFormData>({
    student_id: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    amount: 0,
    payment_method: 'pix',
    notes: '',
    credits_added: 4,
  });

  useEffect(() => {
    fetchStudents();
    fetchPayments();
  }, [fetchStudents, fetchPayments]);

  const totalRevenue = payments.reduce((acc, curr) => acc + Number(curr.amount), 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = payments
    .filter(p => {
      const d = new Date(p.payment_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const selectedStudent = students.find(s => s.id === formData.student_id);

  const recalcAmount = (studentId: string, credits: number) => {
    const student = students.find(s => s.id === studentId);
    const price = student ? Number(student.default_price) : 0;
    return credits * price;
  };

  const handleStudentChange = (studentId: string) => {
    const amount = recalcAmount(studentId, formData.credits_added);
    setFormData({ ...formData, student_id: studentId, amount });
  };

  const handleCreditsChange = (credits: number) => {
    const amount = recalcAmount(formData.student_id, credits);
    setFormData({ ...formData, credits_added: credits, amount });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.student_id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await addPayment({
        student_id: formData.student_id,
        user_id: user.id,
        amount: formData.amount,
        credits_added: formData.credits_added,
        payment_method: formData.payment_method,
        notes: formData.notes || null,
        payment_date: formData.payment_date,
      });
    }
    closeModal();
  };

  const openModal = () => {
    const firstStudent = students.length > 0 ? students[0] : null;
    const defaultCredits = 4;
    const autoAmount = firstStudent ? defaultCredits * Number(firstStudent.default_price) : 0;
    setFormData({
      student_id: firstStudent?.id || '',
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      amount: autoAmount,
      payment_method: 'pix',
      notes: 'Pacote Mensal',
      credits_added: defaultCredits,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal();
    }
  };

  const handleDeleteClick = (payment: any) => {
    setPaymentToDelete(payment.id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (paymentToDelete) {
      await deletePayment(paymentToDelete);
      setPaymentToDelete(null);
    }
  };

  const getMethodIcon = (method: string | null) => {
    switch (method) {
      case 'pix': return <Banknote className="w-5 h-5 text-teal-500" />;
      case 'cartao': return <CreditCard className="w-5 h-5 text-blue-500" />;
      case 'transferencia': return <Wallet className="w-5 h-5 text-indigo-500" />;
      default: return <DollarSign className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Financeiro</h1>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium">
            <Download className="w-5 h-5 mr-2" />
            Exportar
          </button>
          <button
            onClick={openModal}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Recebimento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Receita do Mês</h3>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            R$ {monthlyRevenue.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Receita Total</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            R$ {totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Pagamentos Confirmados</h3>
            <div className="p-2 bg-teal-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-teal-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            {payments.length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Histórico de Pagamentos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Data</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Aluno</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Aulas Adquiridas</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Método</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Valor</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length > 0 ? (
                [...payments].sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()).map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {format(new Date(payment.payment_date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {students.find(s => s.id === payment.student_id)?.name || 'Desconhecido'}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">{payment.notes}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        +{payment.credits_added} aulas
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getMethodIcon(payment.payment_method)}
                        <span className="text-sm capitalize font-medium text-slate-600">{payment.payment_method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-slate-900">R$ {Number(payment.amount).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteClick(payment)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Nenhum pagamento registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Pagamento"
        message="Tem certeza que deseja excluir este pagamento? Isso removerá os créditos correspondentes do saldo do aluno."
      />

      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleBackdropClick}
        >
          <div 
            ref={modalRef}
            className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">Novo Recebimento</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Aluno</label>
                <select
                  required
                  value={formData.student_id}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white"
                >
                  <option value="" disabled>Selecione um aluno...</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} (R$ {Number(student.default_price).toFixed(2)}/aula)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Data</label>
                  <input
                    type="date"
                    required
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Qtd. de Aulas</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.credits_added}
                    onChange={(e) => handleCreditsChange(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Valor Total (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
                {selectedStudent && (
                  <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 font-medium">
                    Sugestão: {formData.credits_added} aulas × R$ {Number(selectedStudent.default_price).toFixed(2)} = <span className="text-indigo-600">R$ {formData.amount.toFixed(2)}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Forma de Pagamento</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white"
                >
                  <option value="pix">PIX</option>
                  <option value="transferencia">Transferência Bancária</option>
                  <option value="cartao">Cartão de Crédito</option>
                  <option value="dinheiro">Dinheiro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Descrição / Notas</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-400"
                  placeholder="Ex: Pacote mensal, aula avulsa..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!formData.student_id}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financial;