import { BrowserRouter } from "react-router-dom";
import UserProvider from "../context/UserProvider";

export function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <UserProvider>{children}</UserProvider>
    </BrowserRouter>
  );
}
