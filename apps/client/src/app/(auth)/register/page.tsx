import { redirect } from 'next/navigation';

/** Alias — customer signup lives at the base URL `/`. */
export default function RegisterAliasPage() {
  redirect('/');
}
