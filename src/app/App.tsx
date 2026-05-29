import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { RouterProvider } from "react-router-dom";
import { router } from "../app/router";
import { AuthProvider } from "../features/auth/context/AuthContext";

function AppDocumentLanguageSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang =
      i18n.resolvedLanguage?.startsWith("es") || i18n.language.startsWith("es")
        ? "es"
        : "en";
    document.documentElement.dir = "ltr";
  }, [i18n.language, i18n.resolvedLanguage]);

  return null;
}

export function App() {
  return (
    <AuthProvider>
      <AppDocumentLanguageSync />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
