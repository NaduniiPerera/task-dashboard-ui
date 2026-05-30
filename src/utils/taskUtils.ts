export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskLike {
  status: TaskStatus;
  priority: TaskPriority;
}

export interface TaskInput {
  title: string;
  description: string;
}

export function filterTasks<T extends TaskLike>(
  tasks: T[],
  statusFilter: string,
  priorityFilter: string
): T[] {
  return tasks.filter((task) => {
    const statusMatch = statusFilter === "all" || task.status === statusFilter;
    const priorityMatch =
      priorityFilter === "all" || task.priority === priorityFilter;

    return statusMatch && priorityMatch;
  });
}

export function validateTaskInput(task: TaskInput): string {
  if (task.title.trim().length < 3) {
    return "Task title must contain at least 3 characters.";
  }

  if (task.description.trim().length < 5) {
    return "Task description must contain at least 5 characters.";
  }

  return "";
}

export function getStatusLabel(status: TaskStatus): string {
  if (status === "todo") {
    return "Todo";
  }

  if (status === "in-progress") {
    return "In Progress";
  }

  return "Done";
}