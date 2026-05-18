import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { userDataContext } from "../context/userContext";
import HomePage from "../features/home/HomePage";
import SignInPage from "../features/auth/SignInPage";
import SignUpPage from "../features/auth/SignUpPage";
import CustomizePage from "../features/customize/CustomizePage";
import Customize2Page from "../features/customize/Customize2Page";

export default function App() {
  const { userData, authReady } = useContext(userDataContext);
  console.log("User Data in App.jsx:", userData);
  if (!authReady) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 flex items-center justify-center text-white text-sm tracking-wide">
        Đang khởi tạo phiên làm việc…
      </div>
    );
  }

  const hasAssistant = Boolean(
    userData?.assistantImage && userData?.assistantName,
  );

  return (
    <Routes>
      <Route
        path="/"
        element={
          !userData ? (
            <Navigate to="/signin" replace />
          ) : hasAssistant ? (
            <HomePage />
          ) : (
            <Navigate to="/customize" replace />
          )
        }
      />
      <Route
        path="/signup"
        element={!userData ? <SignUpPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/signin"
        element={!userData ? <SignInPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/customize"
        element={
          userData ? <CustomizePage /> : <Navigate to="/signin" replace />
        }
      />
      <Route
        path="/customize2"
        element={
          userData ? <Customize2Page /> : <Navigate to="/signin" replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
