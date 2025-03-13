import { useState, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { type Axios } from "axios";

export type User = {
  id: string;
  identities: {
    username: { id: string } | null;
    google: { id: string } | null;
  };
};

export function useWasp() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  async function login() {
    const postLoginMobileAppRedirectUrl = Linking.createURL("/");

    try {
      const result = await WebBrowser.openAuthSessionAsync(
        `${process.env.EXPO_PUBLIC_WASP_CLIENT_URL}/login?postLoginMobileAppRedirectUrl=${postLoginMobileAppRedirectUrl}`,
        postLoginMobileAppRedirectUrl,
        {
          dismissButtonStyle: "cancel",
        }
      );

      if (!result || result.type !== "success") {
        console.error("Login failed");
        return;
      }

      const { queryParams } = Linking.parse(result.url);
      const sessionId = queryParams?.sessionId;

      if (typeof sessionId !== "string") {
        console.error("No sessionId in queryParams");
        return;
      }

      await AsyncStorage.setItem("sessionId", sessionId);
      setSessionId(sessionId);
    } catch (error) {
      console.error("Error opening browser:", error);
    }
  }

  const retrieveSessionId = async () => {
    const storedSessionId = await AsyncStorage.getItem("sessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  };

  useEffect(() => {
    retrieveSessionId();
  }, []);

  useEffect(() => {
    fetchUser();
  }, [sessionId]);

  const fetchUser = async () => {
    if (sessionId) {
      try {
        const client = getWaspApiClient(sessionId);
        const fetchedUser = await client.get<User>("/api/user");
        setUser(fetchedUser.data);
        console.log("User fetched successfully:", fetchedUser);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("sessionId");
    setSessionId(null);
    setUser(null);
  };

  return {
    user,
    isLoggedIn: !!sessionId,
    getWaspApiClient: () => getWaspApiClient(sessionId),
    login,
    logout,
  };
}

function getWaspApiClient(sessionId: string | null): Axios {
  return axios.create({
    baseURL: process.env.EXPO_PUBLIC_WASP_SERVER_URL,
    ...(sessionId && {
      headers: {
        Authorization: `Bearer ${sessionId}`,
      },
    }),
  });
}
