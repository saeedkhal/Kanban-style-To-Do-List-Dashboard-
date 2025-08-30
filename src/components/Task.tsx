import { Button, Card } from "react-bootstrap";
import EditTAskModal from "./EditTAskModal";
import { Trash } from "react-bootstrap-icons";
import type { UseMutationResult } from "@tanstack/react-query";
import type { Task } from "../assets/typs";

function TaskCard({
  task,
  editTaskMutation,
  handleDelete,
}: {
  task: Task;
  editTaskMutation: UseMutationResult<Task, Error, Task, unknown>;
  handleDelete: (id: number) => void;
}) {
  return (
    <div>
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
            <EditTAskModal task={task} editTaskMutation={editTaskMutation} />
            <Button onClick={() => handleDelete(task.id)} variant="outline-danger" size="sm">
              <Trash />
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default TaskCard;
