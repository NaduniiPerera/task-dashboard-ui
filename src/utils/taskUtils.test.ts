import { describe, expect, it } from "vitest";
import { filterTasks, getStatusLabel, validateTaskInput } from "./taskUtils";

describe("taskUtils", () => {
  it("filters tasks by status and priority", () => {
    const tasks = [
      { status: "todo" as const, priority: "high" as const },
      { status: "done" as const, priority: "low" as const },
      { status: "todo" as const, priority: "medium" as const },
    ];

    const result = filterTasks(tasks, "todo", "high");

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("todo");
    expect(result[0].priority).toBe("high");
  });

  it("returns validation message when title is too short", () => {
    const result = validateTaskInput({
      title: "Hi",
      description: "Valid description",
    });

    expect(result).toBe("Task title must contain at least 3 characters.");
  });

  it("returns readable status label", () => {
    const result = getStatusLabel("in-progress");

    expect(result).toBe("In Progress");
  });
});