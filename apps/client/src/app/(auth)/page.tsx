import { redirect } from 'next/navigation';

/** Base URL (/) — send everyone to the public marketplace. */
export default function RootPage() {
  redirect('/home');
}
