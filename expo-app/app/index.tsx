import { useState, useEffect } from "react";
import {
  Button,
  Text,
  View,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeTouchEvent,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";

const COMPUTER_IP = "192.168.1.143.nip.io";
const API_BASE_URL = `http://${COMPUTER_IP}:3001`;
const FRONTEND_BASE_URL = `http://${COMPUTER_IP}:3000`;

const createStorage = () => {
  const setItem = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`AsyncStorage: Error setting item ${key}:`, error);
    }
  };

  const getItem = async (key: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.error(`AsyncStorage: Error getting item ${key}:`, error);
      return null;
    }
  };

  const removeItem = async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`AsyncStorage: Error removing item ${key}:`, error);
    }
  };

  return { setItem, getItem, removeItem };
};

export default function Index() {
  const [tasks, setTasks] = useState<{ description: string }[] | null>(null!);
  const [user, setUser] = useState<any | null>(null!);
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);

  const storage = createStorage();

  const _handleLoginPress = async (
    event: NativeSyntheticEvent<NativeTouchEvent>
  ) => {
    event.preventDefault();
    const postLoginMobileAppRedirectUrl = Linking.createURL("/");

    try {
      const result = await WebBrowser.openAuthSessionAsync(
        `${FRONTEND_BASE_URL}/login?postLoginMobileAppRedirectUrl=${postLoginMobileAppRedirectUrl}`,
        postLoginMobileAppRedirectUrl,
        {
          dismissButtonStyle: "cancel",
        }
      );
      let sessionId: string | undefined;
      if (result && result.type === "success") {
        const { queryParams } = Linking.parse(result.url);
        sessionId = queryParams?.sessionId as string | undefined;
        if (sessionId) {
          await storage.setItem("sessionId", sessionId);
          initApiClient(sessionId);
        } else {
          console.error("No sessionId in queryParams");
        }
      } else {
        console.error("Login failed");
      }
    } catch (error) {
      console.error("Error opening browser:", error);
    }
  };

  const retrieveSessionId = async () => {
    const storedSessionId = await storage.getItem("sessionId");
    if (storedSessionId) {
      initApiClient(storedSessionId);
    }
  };

  useEffect(() => {
    retrieveSessionId();
  }, []);

  const initApiClient = (sessionId: string) => {
    const client = new ApiClient(sessionId);
    setApiClient(client);
  };

  useEffect(() => {
    fetchUser();
    fetchTasks();
  }, [apiClient]);

  const fetchTasks = async () => {
    if (apiClient) {
      try {
        const fetchedTasks = await apiClient.getTasks();
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    }
  };

  const fetchUser = async () => {
    if (apiClient) {
      try {
        const fetchedUser = await apiClient.getUser();
        setUser(fetchedUser);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }
  };

  const handleLogout = async () => {
    await storage.removeItem("sessionId");
    setApiClient(null);
    setTasks(null);
    setUser(null);
  };

  return (
    <View style={styles.container}>
      {!user && <Button title="Login" onPress={_handleLoginPress} />}
      {apiClient ? (
        <View>
          <Text>API Client Initialized</Text>
          <Button title="Fetch Tasks" onPress={fetchTasks} />
          {tasks ? (
            tasks.length > 0 ? (
              <View style={styles.tasksContainer}>
                {tasks.map((task: any) => (
                  <Text key={task.id}>- {task.description}</Text>
                ))}
              </View>
            ) : (
              <Text>No tasks yet</Text>
            )
          ) : (
            <Text>Tasks not fetched yet.</Text>
          )}
          {user && (
            <View style={styles.userContainer}>
              <Text style={styles.user}>{JSON.stringify(user)}</Text>
              <Button title="Logout" onPress={handleLogout} />
            </View>
          )}
        </View>
      ) : (
        <Text>API Client Not Initialized</Text>
      )}
    </View>
  );
}

class ApiClient {
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  async getUser() {
    const response = await fetch(`${API_BASE_URL}/api/user`, {
      headers: {
        Authorization: `Bearer ${this.sessionId}`,
      },
    });
    return response.json();
  }

  async getTasks() {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      headers: {
        Authorization: `Bearer ${this.sessionId}`,
      },
    });
    return response.json();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#ecf0f1",
  },
  tasksContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  userContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  user: {
    marginTop: 20,
    fontSize: 16,
    color: "#333",
    padding: 10,
    backgroundColor: "#ffcc00",
  },
});
