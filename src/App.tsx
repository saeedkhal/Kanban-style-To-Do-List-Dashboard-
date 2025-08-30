import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Card, Button, Form, Modal } from "react-bootstrap";
import { Pencil, Trash } from "react-bootstrap-icons";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    column: "backlog",
  });
const [validated, setValidated] = useState(false); // --- IGNORE ---

  const [columnPages, setColumnPages] = useState<{ [key: string]: number }>({
    backlog: 1,
    "in-progress": 1,
    review: 1,
    done: 1,
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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

  const handleAddSave = () => {
    if (!newTask.title.trim()) return setValidated(true); // --- IGNORE ---
    addTaskMutation.mutate(newTask);
    setNewTask({ title: "", description: "", column: "backlog" });
    setShowAddModal(false);
    setValidated(false); // --- IGNORE ---
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    if (!editingTask?.title?.trim() || !editingTask?.description?.trim()) return setValidated(true); // --- IGNORE ---
    editTaskMutation.mutate(editingTask);
    setShowEditModal(false);
    setValidated(false); // --- IGNORE ---
  };

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
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                  + Add Task
                </Button>
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

                const handlePageChange = (newPage: number) => {
                  setColumnPages((prev) => ({ ...prev, [col.key]: newPage }));
                };

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
                    className={idx !== columns.length - 1 ? "border-end border-1 border-secondary-subtle" : ""}
                  >
                    <h5 className="fw-bold mb-3">{col.title}</h5>
                    {pagedTasks?.map((task) => (
                      <Card
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("dragedTask", JSON.stringify(task));
                        }}
                        key={task.id}
                        className="mb-3 shadow-sm"
                      >
                        <Card.Body>
                          <Card.Title as="h6" className="fw-bold">
                            {task.title}
                          </Card.Title>
                          <Card.Text className="small">{task.description}</Card.Text>
                          <div className="d-flex justify-content-end gap-2">
                            <Button variant="outline-secondary" size="sm" onClick={() => handleEdit(task)}>
                              <Pencil />
                            </Button>
                            <Button onClick={() => handleDelete(task.id)} variant="outline-danger" size="sm">
                              <Trash />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center align-items-center gap-2 mt-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          disabled={page === 1}
                          onClick={() => handlePageChange(page - 1)}
                        >
                          Prev
                        </Button>
                        <span>
                          Page {page} of {totalPages}
                        </span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          disabled={page === totalPages}
                          onClick={() => handlePageChange(page + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </Col>
                );
              })}
            </Row>
          </Card.Body>
        </Card>
      </Container>

      {/* Add Task Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form validated={validated}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                required
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <Form.Control.Feedback type="invalid">Title is required.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                required
                as="textarea"
                rows={3}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <Form.Control.Feedback type="invalid">Description is required.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>Column</Form.Label>
              <Form.Select value={newTask.column} onChange={(e) => setNewTask({ ...newTask, column: e.target.value })}>
                <option value="backlog">Backlog</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddSave} disabled={addTaskMutation.isPending}>
            {addTaskMutation.isPending ? "Saving..." : "Save Task"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Task Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form validated={validated}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                required
                value={editingTask?.title || ""}
                onChange={(e) => setEditingTask((prev) => (prev ? { ...prev, title: e.target.value } : null))}
              />
              <Form.Control.Feedback type="invalid">Title is required.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                required
                value={editingTask?.description || ""}
                onChange={(e) => setEditingTask((prev) => (prev ? { ...prev, description: e.target.value } : null))}
              />
              <Form.Control.Feedback type="invalid">Description is required.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>Column</Form.Label>
              <Form.Select
                value={editingTask?.column || "backlog"}
                onChange={(e) => setEditingTask((prev) => (prev ? { ...prev, column: e.target.value } : null))}
              >
                <option value="backlog">Backlog</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditSave} disabled={editTaskMutation.isPending}>
            {editTaskMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
};

export default KanbanBoard;
