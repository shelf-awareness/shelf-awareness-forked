import { Col, Container, Row } from 'react-bootstrap';
import ShoppingListView from './ShoppingListView';
import '../../styles/buttons.css';

function ShoppingListClient({ initialShoppingLists }: { initialShoppingLists: any[] }) {
  return (
    <main>
      <Container
        id="view-shopping-list"
        className="px-2 px-md-3 py-1 py-md-3"
      >
        <Row className="mb-2 mb-md-3">
          <Col className="text-center text-md-start">
            <h1 className="mb-0">Your Shopping Lists</h1>
          </Col>
        </Row>

        <Row>
          <Col>
            <ShoppingListView initialShoppingLists={initialShoppingLists} />
          </Col>
        </Row>
      </Container>
    </main>
  );
}

export default ShoppingListClient;
