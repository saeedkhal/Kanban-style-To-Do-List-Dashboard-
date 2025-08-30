import type { UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { Pencil } from "react-bootstrap-icons";
import type { Task } from "../assets/typs";


function EditTAskModal({
  task,
  editTaskMutation,
}: {
  task: Task;
  editTaskMutation: UseMutationResult<Task, Error, Task, unknown>;
}) {
  const [validated, setValidated] = useState(false); // --- IGNORE ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const handleEditSave = () => {
    if (!editingTask?.title?.trim() || !editingTask?.description?.trim()) return setValidated(true); // --- IGNORE ---
    editTaskMutation.mutate(editingTask);
    setShowEditModal(false);
    setValidated(false); // --- IGNORE ---
  };
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  return (
    <div>
      <Button variant="outline-secondary" size="sm" onClick={() => handleEdit(task)}>
        <Pencil />
      </Button>
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
    </div>
  );
}

export default EditTAskModal;
