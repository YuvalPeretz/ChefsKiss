import { ConfigProvider } from 'antd';
import './App.css';
import RecipeSaver from './components/RecipeSaver/RecipeSaver';
import ilHE from 'antd/locale/he_IL';
import { useEffect } from 'react';
import Storage from './managers/Storage';
import useRecipes from './hooks/useRecipes';
import useUser from './hooks/useUser';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import Login from './components/Auth/Login';
import { Spin } from 'antd';

function App() {
  const { refreshRecipes } = useRecipes();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();

  useEffect(() => {
    if (location.pathname.includes('shrek')) {
      Storage.setIsAuthor();
      navigate('/');
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    refreshRecipes();
  }, [refreshRecipes]);

  return (
    <ConfigProvider
      theme={{ cssVar: true, token: { colorPrimary: '#ff85c0' } }}
      direction="rtl"
      locale={ilHE}
    >
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <RecipeSaver /> : <Navigate to="/login" replace />}
        />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/shrek" element={<Spin tip="טוען הרשאות" fullscreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfigProvider>
  );
}

export default App;
