import { redirect } from 'next/navigation';

export default function RootLoginPage() {
  // Redirect to the default locale (zh)
  redirect('/zh/login');
} 