import { useAppStore } from '../store/useAppStore';

export function useStudents() {
  const students = useAppStore((state) => state.students);
  const loading = useAppStore((state) => state.loadingStatus.students);
  const error = useAppStore((state) => state.error);
  const fetchStudents = useAppStore((state) => state.fetchStudents);
  const addStudent = useAppStore((state) => state.addStudent);
  const updateStudent = useAppStore((state) => state.updateStudent);
  const deleteStudent = useAppStore((state) => state.deleteStudent);

  return { students, loading, error, fetchStudents, addStudent, updateStudent, deleteStudent };
}
