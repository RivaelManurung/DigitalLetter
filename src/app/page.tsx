import { redirect } from 'next/navigation';

/** Tidak ada halaman depan: proxy meneruskan ke /login bila belum masuk. */
export default function HomePage() {
  redirect('/dashboard');
}
