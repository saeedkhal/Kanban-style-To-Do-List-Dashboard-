import { Col, Form, Row } from "react-bootstrap";
import AddTaskModal from "./AddTaskModal";
import type { UseMutationResult } from "@tanstack/react-query";
import type { Task } from "../assets/typs";


function Header({
  search,
  setSearch,
  addTaskMutation,
}: {
  search: string;
  setSearch: (search: string) => void;
  addTaskMutation: UseMutationResult<Task, Error, Omit<Task, "id">, unknown>;
}) {
  return (
    <div>
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
    </div>
  );
}

export default Header;
