import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AboutClient from './AboutClient';

export const metadata = {
  title: 'About | Chandan Art Gallery',
  description: 'Custom framing studio in New Delhi — wood frames, canvas prints, and religious art.',
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f5] dark:bg-neutral-950">
      <Navbar />
      <main className="flex-grow">
        <AboutClient />
      </main>
      <Footer />
    </div>
  );
}
