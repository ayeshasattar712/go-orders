import { redirect } from 'next/navigation';

/** Admin staff self-registration is disabled — Super Admin creates users at /admin/users. */
export default function AdminRegisterPage() {
  redirect('/admin/login');
}
