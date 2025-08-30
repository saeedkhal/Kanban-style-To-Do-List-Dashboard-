import { useState } from "react";
import { Col } from "react-bootstrap";
import Pagination from "./Pagination";
import TaskCard from "./Task";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type Task = {
  id: number;
  title: string;
  description: string;
  column: string;
};
const TASKS_PER_PAGE = 5;

function TaskColumn({
  col,
  tasks,
  columns,
  idx,
}: {
  col: { key: string; title: string };
  tasks: Task[];
  columns: { key: string; title: string }[];
  idx: number;
}) {
  const [columnPages, setColumnPages] = useState<{ [key: string]: number }>({
    backlog: 1,
    "in-progress": 1,
    review: 1,
    done: 1,
  });
  const handlePageChange = (newPage: number, col: string) => {
    setColumnPages((prev) => ({ ...prev, [col]: newPage }));
  };

  const API_URL = "http://localhost:4000/tasks";
  // Pagination logic for this column
  const colTasks = tasks.filter((task) => task.column === col.key);
  const page = columnPages[col.key] || 1;
  const totalPages = Math.ceil(colTasks.length / TASKS_PER_PAGE) || 1;
  const pagedTasks = colTasks.slice((page - 1) * TASKS_PER_PAGE, page * TASKS_PER_PAGE) || [];

  const queryClient = useQueryClient();

  const editTaskMutation = useMutation({
    mutationFn: (task: Task) => axios.put<Task>(`${API_URL}/${task.id}`, task).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => axios.delete(`${API_URL}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  // Handlers
  const handleDelete = (id: number) => deleteTaskMutation.mutate(id);
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
}

export default TaskColumn;
