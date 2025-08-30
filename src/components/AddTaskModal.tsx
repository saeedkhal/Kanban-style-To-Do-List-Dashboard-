import type { UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

type Task = {
  id: number;
  title: string;
  description: string;
  column: string;
};
function AddTaskModal({
  addTaskMutation,
}: {
  addTaskMutation: UseMutationResult<Task, Error, Omit<Task, "id">, unknown>;
}) {
  const [validated, setValidated] = useState(false); // --- IGNORE ---
  const [showAddModal, setShowAddModal] = useState(false);
  const handleAddSave = () => {
    if (!newTask.title.trim()) return setValidated(true); // --- IGNORE ---
    addTaskMutation.mutate(newTask);
    setNewTask({ title: "", description: "", column: "backlog" });
    setShowAddModal(false);
    setValidated(false); // --- IGNORE ---
  };

  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    column: "backlog",
  });

  return (
    <>
      <Button variant="primary" onClick={() => setShowAddModal(true)}>
        + Add Task
      </Button>
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
    </>
  );
}

export default AddTaskModal;
