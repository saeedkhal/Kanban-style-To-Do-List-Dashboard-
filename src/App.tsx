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
    if (!newTask.title.trim()) return;
    addTaskMutation.mutate(newTask);
    setNewTask({ title: "", description: "", column: "backlog" });
    setShowAddModal(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    if (!editingTask) return;
    editTaskMutation.mutate(editingTask);
    setShowEditModal(false);
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
                return (
                  <Col
                    key={col.key}
                    md={3}
                    className={idx !== columns.length - 1 ? "border-end border-1 border-secondary-subtle" : ""}
                  >
                    <h5 className="fw-bold mb-3">{col.title}</h5>
                    {tasks
                      ?.filter((task) => task.column === col.key)
                      .map((task) => (
                        <Card key={task.id} className="mb-3 shadow-sm">
                          <Card.Body>
                            <Card.Title as="h6" className="fw-bold">
                              {task.title}
                            </Card.Title>
                            <Card.Text className="small">{task.description}</Card.Text>
                            <div className="d-flex justify-content-end gap-2">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleEdit(task)}
                              >
                                <Pencil />
                              </Button>
                              <Button onClick={() => handleDelete(task.id)} variant="outline-danger" size="sm">
                                <Trash />
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
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
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
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
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={editingTask?.title || ""}
                onChange={(e) => setEditingTask((prev) => (prev ? { ...prev, title: e.target.value } : null))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editingTask?.description || ""}
                onChange={(e) => setEditingTask((prev) => (prev ? { ...prev, description: e.target.value } : null))}
              />
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
