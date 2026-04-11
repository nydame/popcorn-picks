import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import SearchPage from './pages/SearchPage';
import FavoritesPage from './pages/FavoritesPage';
import RecommendationsPage from './pages/RecommendationsPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <ThemeProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/search" replace />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="*" element={<Navigate to="/search" replace />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
