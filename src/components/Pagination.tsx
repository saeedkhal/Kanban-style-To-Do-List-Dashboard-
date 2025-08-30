import { Button } from "react-bootstrap";

function Pagination({
  totalPages,
  page,
  handlePageChange,
  col,
}: {
  totalPages: number;
  page: number;
  handlePageChange: (newPage: number, columnKey: string) => void;
  col: { key: string; title: string };
}) {
  return (
    <div>
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-2">
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1, col.key)}
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
            onClick={() => handlePageChange(page + 1, col.key)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default Pagination;
