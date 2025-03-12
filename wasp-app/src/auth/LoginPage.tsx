import { clearSessionId } from "wasp/client/api";
import { LoginForm, useAuth } from "wasp/client/auth";
// import { Navigate } from "react-router-dom";

export function LoginPage() {
  // const { data: user } = useAuth();
  const postLoginMobileAppRedirectUrl = new URLSearchParams(
    window.location.search
  ).get("postLoginMobileAppRedirectUrl");

  if (postLoginMobileAppRedirectUrl) {
    localStorage.setItem(
      "postLoginMobileAppRedirectUrl",
      postLoginMobileAppRedirectUrl
    );
    // Force clear session id to force login
    clearSessionId();
  }
  // You can redirect already logged in users if you don't want to force
  // users to log in each time
  // if (user) {
  //   return <Navigate to="/login-success" />;
  // }
  return (
    <main>
      <LoginForm />
    </main>
  );
}
