import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { useTheme } from '../store/contexts/ThemeContext';
import { Footer } from '../features/landing/components/Footer';

export default function MainLayout() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-accent selection:text-brand-black bg-gray-50 dark:bg-brand-black text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
