import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to the default locale (zh)
  redirect('/zh');
}
