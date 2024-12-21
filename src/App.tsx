import { ConfigProvider } from "antd";
import "./App.css";
import RecipeSaver from "./components/RecipeSaver/RecipeSaver";
import ilHE from "antd/locale/he_IL";
import { useEffect } from "react";
import Storage from "./managers/Storage";
import useRecipes from "./hooks/useRecipes";
import { useLocation, useNavigate } from "react-router";

function App() {
  const { refreshRecipes } = useRecipes();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname.includes("shrek")) {
      Storage.setIsAuthor();
      navigate("/");
    }
  }, [location.pathname]);

  useEffect(() => {
    refreshRecipes();
  }, []);

  return (
    <ConfigProvider theme={{ cssVar: true, token: { colorPrimary: "#ff85c0" } }} direction="rtl" locale={ilHE}>
      <RecipeSaver />
    </ConfigProvider>
  );
}

export default App;
