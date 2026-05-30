import { useEffect, useMemo, useState } from "react";

type TaskStatus = "todo" | "in-progress" | "done";
type TaskPriority = "low" | "medium" | "high";
type ViewMode = "list" | "kanban";
type AuthMode = "login" | "register";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  categoryId?: string;
}

interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
}

interface AuthFormData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token?: string;
  message?: string;
}

const API_BASE_URL = "http://localhost:3000";

const emptyTaskForm: TaskFormData = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
};

const emptyAuthForm: AuthFormData = {
  name: "",
  email: "",
  password: "",
};

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskForm, setTaskForm] = useState<TaskFormData>(emptyTaskForm);
  const [authForm, setAuthForm] = useState<AuthFormData>(emptyAuthForm);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [token, setToken] = useState<string>(() => localStorage.getItem("token") || "");

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  async function fetchTasks() {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const errorData = data as { message?: string };
        throw new Error(errorData.message || "Failed to fetch tasks");
      }

      if (Array.isArray(data)) {
        setTasks(normalizeTasks(data));
      } else if (
        typeof data === "object" &&
        data !== null &&
        "tasks" in data &&
        Array.isArray((data as { tasks: unknown }).tasks)
      ) {
        setTasks(normalizeTasks((data as { tasks: unknown[] }).tasks));
      } else {
        setTasks([]);
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Cannot load tasks. Please check backend server or login again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function normalizeTasks(data: unknown[]): Task[] {
    return data.map((item, index) => {
      const task = item as Partial<Task>;

      return {
        id: String(task.id ?? index + 1),
        title: String(task.title ?? ""),
        description: String(task.description ?? ""),
        status: task.status ?? "todo",
        priority: task.priority ?? "medium",
        createdAt: String(task.createdAt ?? new Date().toISOString()),
        updatedAt: String(task.updatedAt ?? new Date().toISOString()),
        categoryId: task.categoryId,
      };
    });
  }

  async function handleAuthSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!authForm.email.trim() || !authForm.password.trim()) {
      setMessage("Email and password are required.");
      return;
    }

    if (authMode === "register" && !authForm.name.trim()) {
      setMessage("Name is required for registration.");
      return;
    }

    try {
      setMessage("");

      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";

      const requestBody =
        authMode === "login"
          ? {
              email: authForm.email,
              password: authForm.password,
            }
          : {
              name: authForm.name,
              email: authForm.email,
              password: authForm.password,
            };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      if (!data.token) {
        throw new Error("Token was not returned from backend.");
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setAuthForm(emptyAuthForm);
      setMessage("");
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Authentication failed. Check your email and password.");
      }
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setTasks([]);
    setMessage("Logged out successfully.");
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const statusMatch = statusFilter === "all" || task.status === statusFilter;
      const priorityMatch = priorityFilter === "all" || task.priority === priorityFilter;

      return statusMatch && priorityMatch;
    });
  }, [tasks, statusFilter, priorityFilter]);

  function openAddModal() {
    setEditingTask(null);
    setTaskForm(emptyTaskForm);
    setMessage("");
    setIsTaskModalOpen(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
    });
    setMessage("");
    setIsTaskModalOpen(true);
  }

  function closeTaskModal() {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setTaskForm(emptyTaskForm);
  }

  function handleTaskInputChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setTaskForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleAuthInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setAuthForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function validateTaskForm() {
    if (taskForm.title.trim().length < 3) {
      setMessage("Task title must contain at least 3 characters.");
      return false;
    }

    if (taskForm.description.trim().length < 5) {
      setMessage("Task description must contain at least 5 characters.");
      return false;
    }

    return true;
  }

  async function handleTaskSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateTaskForm()) {
      return;
    }

    if (editingTask) {
      await updateTask();
    } else {
      await createTask();
    }
  }

  async function createTask() {
    const temporaryTask: Task = {
      id: crypto.randomUUID(),
      ...taskForm,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const oldTasks = tasks;
    setTasks((previous) => [temporaryTask, ...previous]);
    closeTaskModal();

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create task");
      }

      await fetchTasks();
    } catch (error) {
      setTasks(oldTasks);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Could not create task. Please check your backend API.");
      }
    }
  }

  async function updateTask() {
    if (!editingTask) {
      return;
    }

    const updatedTask: Task = {
      ...editingTask,
      ...taskForm,
      updatedAt: new Date().toISOString(),
    };

    const oldTasks = tasks;

    setTasks((previous) =>
      previous.map((task) => (task.id === editingTask.id ? updatedTask : task))
    );

    closeTaskModal();

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update task");
      }

      await fetchTasks();
    } catch (error) {
      setTasks(oldTasks);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Could not update task. Please check your backend API.");
      }
    }
  }

  async function deleteTask(taskId: string) {
    const confirmed = window.confirm("Are you sure you want to delete this task?");

    if (!confirmed) {
      return;
    }

    const oldTasks = tasks;
    setTasks((previous) => previous.filter((task) => task.id !== taskId));

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete task");
      }
    } catch (error) {
      setTasks(oldTasks);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Could not delete task. Please try again.");
      }
    }
  }

  function handleDragStart(event: React.DragEvent<HTMLDivElement>, taskId: string) {
    event.dataTransfer.setData("taskId", taskId);
  }

  async function handleDrop(event: React.DragEvent<HTMLDivElement>, newStatus: TaskStatus) {
    event.preventDefault();

    const taskId = event.dataTransfer.getData("taskId");
    const task = tasks.find((item) => item.id === taskId);

    if (!task) {
      return;
    }

    const oldTasks = tasks;
    const updatedTask: Task = {
      ...task,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    setTasks((previous) =>
      previous.map((item) => (item.id === taskId ? updatedTask : item))
    );

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: updatedTask.title,
          description: updatedTask.description,
          status: updatedTask.status,
          priority: updatedTask.priority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to move task");
      }
    } catch (error) {
      setTasks(oldTasks);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Could not move task.");
      }
    }
  }

  function getStatusBadgeClass(status: TaskStatus) {
    if (status === "todo") {
      return "bg-yellow-100 text-yellow-800";
    }

    if (status === "in-progress") {
      return "bg-blue-100 text-blue-800";
    }

    return "bg-green-100 text-green-800";
  }

  function getPriorityClass(priority: TaskPriority) {
    if (priority === "high") {
      return "text-red-600";
    }

    if (priority === "medium") {
      return "text-orange-600";
    }

    return "text-green-600";
  }

  function formatDate(dateValue: string) {
    return new Date(dateValue).toLocaleDateString();
  }

  const pageClass = darkMode
    ? "min-h-screen bg-gray-950 text-gray-100"
    : "min-h-screen bg-gray-100 text-gray-900";

  if (!token) {
    return (
      <main className={pageClass}>
        <section className="flex min-h-screen items-center justify-center px-4 py-10">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-gray-900">Task Dashboard</h1>
              <p className="mt-2 text-gray-600">
                {authMode === "login"
                  ? "Login to manage your tasks."
                  : "Create an account to start managing tasks."}
              </p>
            </div>

            {message && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {message}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "register" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Name
                  </label>
                  <input
                    name="name"
                    value={authForm.name}
                    onChange={handleAuthInputChange}
                    className="w-full rounded-xl border border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={authForm.email}
                  onChange={handleAuthInputChange}
                  className="w-full rounded-xl border border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={authForm.password}
                  onChange={handleAuthInputChange}
                  className="w-full rounded-xl border border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gray-900 px-4 py-3 font-bold text-white hover:bg-gray-700"
              >
                {authMode === "login" ? "Login" : "Register"}
              </button>
            </form>

            <button
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
                setMessage("");
              }}
              className="mt-5 w-full text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              {authMode === "login"
                ? "Need an account? Register"
                : "Already have an account? Login"}
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="mt-4 w-full rounded-xl border border-gray-400 bg-white px-4 py-3 font-semibold text-gray-900 hover:bg-gray-100"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={pageClass}>
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
        <header className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Manage your tasks using your Lab 1 REST API.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-900 hover:bg-gray-100"
              >
                {darkMode ? "Light" : "Dark"}
              </button>

              <button
                onClick={logout}
                className="rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-900 hover:bg-gray-100"
              >
                Logout
              </button>

              <button
                onClick={openAddModal}
                className="rounded-xl bg-gray-900 px-5 py-3 font-bold text-white hover:bg-gray-700"
              >
                + Add Task
              </button>
            </div>
          </div>
        </header>

        <section className="mb-6 grid gap-4 rounded-3xl bg-white p-5 shadow-sm md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-xl border border-gray-400 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Filter by Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="w-full rounded-xl border border-gray-400 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              View Mode
            </label>
            <select
              value={viewMode}
              onChange={(event) => setViewMode(event.target.value as ViewMode)}
              className="w-full rounded-xl border border-gray-400 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
            >
              <option value="list">List View</option>
              <option value="kanban">Kanban View</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter("all");
                setPriorityFilter("all");
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-900 hover:bg-gray-100"
            >
              Clear Filters
            </button>
          </div>
        </section>

        {message && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">
            {message}
          </div>
        )}

        {loading && (
          <div className="rounded-3xl bg-white p-8 text-center text-gray-700 shadow-sm">
            Loading tasks...
          </div>
        )}

        {!loading && filteredTasks.length === 0 && (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">No tasks found</h2>
            <p className="mt-2 text-gray-600">
              Add a new task or change your filters.
            </p>
            <button
              onClick={openAddModal}
              className="mt-5 rounded-xl bg-gray-900 px-5 py-3 font-bold text-white hover:bg-gray-700"
            >
              Add Your First Task
            </button>
          </div>
        )}

        {!loading && filteredTasks.length > 0 && viewMode === "list" && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                getStatusBadgeClass={getStatusBadgeClass}
                getPriorityClass={getPriorityClass}
                formatDate={formatDate}
                onEdit={openEditModal}
                onDelete={deleteTask}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        )}

        {!loading && filteredTasks.length > 0 && viewMode === "kanban" && (
          <div className="grid gap-5 lg:grid-cols-3">
            {(["todo", "in-progress", "done"] as TaskStatus[]).map((status) => (
              <div
                key={status}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(event, status)}
                className="min-h-96 rounded-3xl bg-white p-5 shadow-sm"
              >
                <h2 className="mb-4 text-xl font-bold capitalize text-gray-900">
                  {status}
                </h2>

                <div className="space-y-4">
                  {filteredTasks
                    .filter((task) => task.status === status)
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        getStatusBadgeClass={getStatusBadgeClass}
                        getPriorityClass={getPriorityClass}
                        formatDate={formatDate}
                        onEdit={openEditModal}
                        onDelete={deleteTask}
                        onDragStart={handleDragStart}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingTask ? "Edit Task" : "Add New Task"}
              </h2>

              <button
                onClick={closeTaskModal}
                className="rounded-lg px-3 py-1 text-2xl font-bold text-gray-600 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Title
                </label>
                <input
                  name="title"
                  value={taskForm.title}
                  onChange={handleTaskInputChange}
                  className="w-full rounded-xl border border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Description
                </label>
                <textarea
                  name="description"
                  value={taskForm.description}
                  onChange={handleTaskInputChange}
                  rows={4}
                  className="w-full rounded-xl border border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500"
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Status
                  </label>
                  <select
                    name="status"
                    value={taskForm.status}
                    onChange={handleTaskInputChange}
                    className="w-full rounded-xl border border-gray-400 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={taskForm.priority}
                    onChange={handleTaskInputChange}
                    className="w-full rounded-xl border border-gray-400 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closeTaskModal}
                  className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-900 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gray-900 px-4 py-3 font-bold text-white hover:bg-gray-700"
                >
                  {editingTask ? "Update Task" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

interface TaskCardProps {
  task: Task;
  getStatusBadgeClass: (status: TaskStatus) => string;
  getPriorityClass: (priority: TaskPriority) => string;
  formatDate: (dateValue: string) => string;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
}

function TaskCard({
  task,
  getStatusBadgeClass,
  getPriorityClass,
  formatDate,
  onEdit,
  onDelete,
  onDragStart,
}: TaskCardProps) {
  return (
    <div
      draggable
      onDragStart={(event) => onDragStart(event, task.id)}
      className="rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusBadgeClass(
            task.status
          )}`}
        >
          {task.status}
        </span>
      </div>

      <p className="mb-4 text-sm leading-6 text-gray-600">
        {task.description}
      </p>

      <div className="mb-4 space-y-2 text-sm text-gray-700">
        <p>
          <span className="font-semibold">Priority:</span>{" "}
          <span className={`font-bold ${getPriorityClass(task.priority)}`}>
            {task.priority}
          </span>
        </p>

        <p>
          <span className="font-semibold">Created:</span>{" "}
          {formatDate(task.createdAt)}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onEdit(task)}
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-900 hover:bg-gray-100"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(task.id)}
          className="flex-1 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default App;