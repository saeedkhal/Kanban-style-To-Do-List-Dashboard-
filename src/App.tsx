import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Card } from "react-bootstrap";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "./components/Header";
import TaskColumn from "./components/TaskColumn";
import type { Task } from "./assets/typs";

let timer: number | undefined = undefined;

const columns = [
  { key: "backlog", title: "Backlog" },
  { key: "in-progress", title: "In Progress" },
  { key: "review", title: "Review" },
  { key: "done", title: "Done" },
];

const API_URL = "http://localhost:4000/tasks";

const fetchTasks = async (search: string): Promise<Task[]> => {
  let url = API_URL;
  if (search.trim()) {
    url += `?q=${encodeURIComponent(search)}`;
  }
  const { data } = await axios.get(url);
  return data;
};
const KanbanBoard = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Fetch tasks with React Query, using debouncedSearch
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", debouncedSearch],
    queryFn: () => fetchTasks(debouncedSearch),
  });

  const queryClient = useQueryClient();

  // Mutations
  const addTaskMutation = useMutation({
    mutationFn: (task: Omit<Task, "id">) => axios.post<Task>(API_URL, task).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  useEffect(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <main className="bg-dark bg-opacity-10 min-vh-100">
      <Container fluid="xxl" className="py-4">
        <h1 className="fw-bold mb-4 text-center">Kanban Board</h1>
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            {/* Header */}
            <Header search={search} setSearch={setSearch} addTaskMutation={addTaskMutation} />
            <div className="border-bottom border-1 border-secondary-subtle mb-3" />

            {/* Kanban Columns */}
            <Row>
              {columns.map((col, idx) => {
                return <TaskColumn key={col.key} col={col} tasks={tasks} columns={columns} idx={idx} />;
              })}
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </main>
  );
};

export default KanbanBoard;
