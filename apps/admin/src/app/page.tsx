import { redirect } from 'next/navigation';

/** Admin base URL — staff entry is login only (no public signup). */
export default function AdminRootPage() {
  redirect('/admin/login');
}
