import { useState } from "react";
import {
  Button,
  Text,
  View,
  StyleSheet,
  GestureResponderEvent,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import Constants from "expo-constants";
import { User, useWasp } from "@/hooks/wasp";
import { Ionicons } from "@expo/vector-icons";

type Task = { description: string; isDone: boolean; id: number };

export default function Index() {
  const { user, login, logout, getWaspApiClient, isLoggedIn } = useWasp();

  const [tasks, setTasks] = useState<Task[] | null>(null!);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleLoginPress(event: GestureResponderEvent) {
    event.preventDefault();
    login();
  }

  async function fetchTasks() {
    setIsLoading(true);
    try {
      const client = getWaspApiClient();
      const tasks = await client.get<
        { description: string; isDone: boolean; id: number }[]
      >("/api/tasks");
      setTasks(tasks.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }

  async function updateTaskIsDone(taskId: number, isDone: boolean) {
    try {
      const client = getWaspApiClient();
      await client.post(`/api/tasks/${taskId}/done`, {
        isDone,
      });
      await fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Manager</Text>
        {isLoggedIn ? (
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color="#ff5252" />
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>

      {!isLoggedIn ? (
        <View style={styles.loginContainer}>
          <Text style={styles.welcomeText}>Welcome to Task Manager</Text>
          <Text style={styles.subtitleText}>Please login to continue</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLoginPress}
          >
            <Text style={styles.loginButtonText}>Login</Text>
            <Ionicons name="log-in-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.userInfoCard}>
            <View style={styles.userInfoContent}>
              <Ionicons
                name="person-circle-outline"
                size={32}
                color="#4dabf7"
              />
              <Text style={styles.userText}>
                {user && getUserDisplayName(user)}
              </Text>
            </View>
          </View>

          <View style={styles.tasksSection}>
            <View style={styles.taskHeaderRow}>
              <Text style={styles.tasksSectionTitle}>Your Tasks</Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={fetchTasks}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#4dabf7" />
                ) : (
                  <Ionicons name="refresh-outline" size={22} color="#4dabf7" />
                )}
              </TouchableOpacity>
            </View>

            {tasks === null ? (
              <TouchableOpacity
                style={styles.fetchTasksButton}
                onPress={fetchTasks}
                disabled={isLoading}
              >
                <Text style={styles.fetchTasksButtonText}>
                  {isLoading ? "Loading..." : "Fetch Tasks"}
                </Text>
              </TouchableOpacity>
            ) : (
              <ScrollView
                style={styles.tasksList}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
              >
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <View
                      key={task.id}
                      style={styles.taskCard}
                      onTouchEnd={() => updateTaskIsDone(task.id, !task.isDone)}
                    >
                      <View style={styles.taskStatusIndicator}>
                        <Ionicons
                          name={
                            task.isDone ? "checkmark-circle" : "ellipse-outline"
                          }
                          size={24}
                          color={task.isDone ? "#40c057" : "#adb5bd"}
                        />
                      </View>
                      <Text style={styles.taskDescription}>
                        {task.description}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyTasksContainer}>
                    <Ionicons
                      name="document-text-outline"
                      size={48}
                      color="#dee2e6"
                    />
                    <Text style={styles.emptyTasksText}>
                      No tasks available
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

function getUserDisplayName(user: User) {
  if (user.identities.username) {
    return user.identities.username.id;
  } else if (user.identities.google) {
    return user.identities.google.id;
  } else {
    return "User";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Constants.statusBarHeight + 10,
    paddingBottom: 15,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#343a40",
  },
  logoutButton: {
    padding: 8,
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#343a40",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 40,
    textAlign: "center",
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4dabf7",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: "80%",
    shadowColor: "#4dabf7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  userInfoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  userInfoContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  userText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#343a40",
    marginLeft: 10,
  },
  tasksSection: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tasksSectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#343a40",
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f1f3f5",
  },
  fetchTasksButton: {
    backgroundColor: "#4dabf7",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    shadowColor: "#4dabf7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  fetchTasksButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  tasksList: {
    flex: 1,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  taskStatusIndicator: {
    marginRight: 12,
  },
  taskDescription: {
    fontSize: 16,
    color: "#495057",
    flex: 1,
  },
  emptyTasksContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTasksText: {
    marginTop: 16,
    fontSize: 16,
    color: "#adb5bd",
    textAlign: "center",
  },
});
