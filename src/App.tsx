import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { Pencil, Trash } from "react-bootstrap-icons";

const demoTasks = [
  {
    id: 1,
    title: "Design Homepage",
    description: "Create wireframes and mockups for the new homepage.",
    column: "backlog",
  },
  {
    id: 2,
    title: "Implement Auth",
    description: "Set up user authentication with JWT.",
    column: "in-progress",
  },
  {
    id: 3,
    title: "Code Review",
    description: "Review the new feature branch before merging.",
    column: "review",
  },
  {
    id: 4,
    title: "Deploy to Production",
    description: "Deploy the latest version to the production environment.",
    column: "done",
  },
];

const KanbanBoard = () => {

  const columns = [
    { key: "backlog", title: "Backlog" },
    { key: "in-progress", title: "In Progress" },
    { key: "review", title: "Review" },
    { key: "done", title: "Done" },
  ];

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
                  type="text"
                  placeholder="Search by task title or description"
                />
              </Col>
              <Col xs="auto" className="text-end">
                <Button variant="primary">
                  Add Task
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
                    {demoTasks
                      ?.filter((task) => task.column === col.key)
                      .map((task) => (
                        <Card
                          key={task.id}
                          className="mb-3 shadow-sm"
                        >
                          <Card.Body>
                            <Card.Title as="h6" className="fw-bold">
                              {task.title}
                            </Card.Title>
                            <Card.Text className="small">{task.description}</Card.Text>
                            <div className="d-flex justify-content-end gap-2">
                              <Button variant="outline-secondary" size="sm">
                                <Pencil />
                              </Button>
                              <Button variant="outline-danger" size="sm">
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
    </main>
  );
};

export default KanbanBoard;
