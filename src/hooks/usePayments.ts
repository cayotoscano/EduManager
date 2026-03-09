import { useAppStore } from '../store/useAppStore';

export function usePayments() {
  const payments = useAppStore((state) => state.payments);
  const loading = useAppStore((state) => state.loadingStatus.payments);
  const error = useAppStore((state) => state.error);
  const fetchPayments = useAppStore((state) => state.fetchPayments);
  const addPayment = useAppStore((state) => state.addPayment);
  const deletePayment = useAppStore((state) => state.deletePayment);

  return { payments, loading, error, fetchPayments, addPayment, deletePayment };
}
