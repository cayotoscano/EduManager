import { useAppStore } from '../store/useAppStore';

export function useSessions() {
  const sessions = useAppStore((state) => state.sessions);
  const loading = useAppStore((state) => state.loadingStatus.sessions);
  const error = useAppStore((state) => state.error);
  const fetchSessions = useAppStore((state) => state.fetchSessions);
  const addSession = useAppStore((state) => state.addSession);
  const updateSession = useAppStore((state) => state.updateSession);
  const deleteSession = useAppStore((state) => state.deleteSession);
  const completeSession = useAppStore((state) => state.completeSession);

  return { sessions, loading, error, fetchSessions, addSession, updateSession, deleteSession, completeSession };
}
