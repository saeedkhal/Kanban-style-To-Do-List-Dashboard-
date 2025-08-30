const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/tasks";
const TASKS_PER_PAGE = 5;
const columns = [
  { key: "backlog", title: "Backlog" },
  { key: "in-progress", title: "In Progress" },
  { key: "review", title: "Review" },
  { key: "done", title: "Done" },
];

export { API_URL, TASKS_PER_PAGE, columns };
