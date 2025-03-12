import { getSessionId } from "wasp/client/api";
import React from "react";
import { Navigate } from "react-router-dom";
export function LoginSuccessPage() {
  const postLoginMobileAppRedirectUrl = localStorage.getItem(
    "postLoginMobileAppRedirectUrl"
  );

  if (postLoginMobileAppRedirectUrl) {
    localStorage.removeItem("postLoginMobileAppRedirectUrl");
    window.location.href =
      postLoginMobileAppRedirectUrl + "?sessionId=" + getSessionId();
    return null;
  } else {
    return <Navigate to="/" />;
  }
}
