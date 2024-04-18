import { useState, useEffect } from 'react';
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row,
  Alert
} from 'react-bootstrap';

import Auth from '../utils/auth';
import { saveBook, searchGoogleBooks } from '../utils/API';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());
  const [error, setError] = useState('');

  useEffect(() => {
    // This will now trigger whenever savedBookIds changes
    const handleSaveToLocalStorage = () => {
      saveBookIds(savedBookIds);
    };
    handleSaveToLocalStorage();

    // Cleanup function if needed when the component unmounts
    return handleSaveToLocalStorage;
  }, [savedBookIds]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!searchInput) return;

    setError('');
    try {
      const response = await searchGoogleBooks(searchInput);
      if (!response.ok) throw new Error('Failed to fetch data.');
      const { items } = await response.json();
      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
      }));
      setSearchedBooks(bookData);
    } catch (err) {
      console.error(err);
      setError('Error fetching books. Please try again later.');
    }
  };

  const handleSaveBook = async (bookId) => {
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
    if (!Auth.loggedIn() || !bookToSave) return;

    setError('');
    try {
      const token = Auth.getToken();
      const response = await saveBook(bookToSave, token);
      if (!response.ok) throw new Error('Failed to save the book.');
      setSavedBookIds((prev) => [...prev, bookToSave.bookId]);
    } catch (err) {
      console.error(err);
      setError('Error saving the book. Please try again later.');
    }
  };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {searchedBooks.length ? `Viewing ${searchedBooks.length} results:` : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            const isBookSaved = savedBookIds.includes(book.bookId);
            return (
              <Col md="4" key={book.bookId}>
                <Card border='dark'>
                  {book.image && (
                    <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                  )}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors.join(', ')}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {Auth.loggedIn() && (
                      <Button
                        disabled={isBookSaved}
                        className='btn-block btn-info'
                        onClick={() => handleSaveBook(book.bookId)}>
                        {isBookSaved ? 'This book has already been saved!' : 'Save this Book!'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
