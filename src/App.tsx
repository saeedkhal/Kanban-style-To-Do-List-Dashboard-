import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Card, Form } from "react-bootstrap";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AddTaskModal from "./components/AddTaskModal";
import TaskCard from "./components/Task";
import Pagination from "./components/Pagination";

let timer: number | undefined = undefined;
type Task = {
  id: number;
  title: string;
  description: string;
  column: string;
};
const columns = [
  { key: "backlog", title: "Backlog" },
  { key: "in-progress", title: "In Progress" },
  { key: "review", title: "Review" },
  { key: "done", title: "Done" },
];

const TASKS_PER_PAGE = 5;
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
  const [columnPages, setColumnPages] = useState<{ [key: string]: number }>({
    backlog: 1,
    "in-progress": 1,
    review: 1,
    done: 1,
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handlePageChange = (newPage: number, col: string) => {
    setColumnPages((prev) => ({ ...prev, [col]: newPage }));
  };
  useEffect(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

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

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => axios.delete(`${API_URL}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const editTaskMutation = useMutation({
    mutationFn: (task: Task) => axios.put<Task>(`${API_URL}/${task.id}`, task).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  // Handlers
  const handleDelete = (id: number) => deleteTaskMutation.mutate(id);

  return (
    <main className="bg-dark bg-opacity-10 min-vh-100">
      <Container fluid="xxl" className="py-4">
        <h1 className="fw-bold mb-4 text-center">Kanban Board</h1>
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            {/* Header */}
            <Row className="mb-4 align-items-center">
              <Col>
                <Form.Control
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="text"
                  placeholder="Search by task title or description"
                />
              </Col>
              <Col xs="auto" className="text-end">
                <AddTaskModal addTaskMutation={addTaskMutation} />
              </Col>
            </Row>
            <div className="border-bottom border-1 border-secondary-subtle mb-3" />

            {/* Kanban Columns */}
            <Row>
              {columns.map((col, idx) => {
                // Pagination logic for this column
                const colTasks = tasks.filter((task) => task.column === col.key);
                const page = columnPages[col.key] || 1;
                const totalPages = Math.ceil(colTasks.length / TASKS_PER_PAGE) || 1;
                const pagedTasks = colTasks.slice((page - 1) * TASKS_PER_PAGE, page * TASKS_PER_PAGE) || [];

                return (
                  <Col
                    key={col.key}
                    md={3}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const task = JSON.parse(e.dataTransfer.getData("dragedTask"));

                      if (task && task.column !== col.key) {
                        editTaskMutation.mutate({ ...task, column: col.key });
                      }
                    }}
                    className={idx !== columns.length - 1 ? "responsive-border py-3" : "py-3"}
                  >
                    <h5 className="fw-bold mb-3">{col.title}</h5>
                    {pagedTasks?.map((task) => (
                      <div key={task.id}>
                        <TaskCard task={task} editTaskMutation={editTaskMutation} handleDelete={handleDelete} />
                      </div>
                    ))}
                    <Pagination totalPages={totalPages} page={page} handlePageChange={handlePageChange} col={col} />
                  </Col>
                );
              })}
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </main>
  );
};

export default KanbanBoard;
