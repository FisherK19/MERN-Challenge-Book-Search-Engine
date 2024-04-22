import React from "react";
import {
  Container,
  Card,
  Button,
} from "react-bootstrap";
import { useQuery, useMutation } from "@apollo/client";

import Auth from "../utils/auth";
import { removeBookId } from "../utils/localStorage";
import { GET_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutation";

const SavedBooks = () => {
  const { loading, data } = useQuery(GET_ME);
  const userData = data?.me;
  const [deleteBook] = useMutation(REMOVE_BOOK);

  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      await deleteBook({
        variables: { bookId: bookId },
      });
      removeBookId(bookId); // Remove the book's ID from localStorage
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <div className="p-5 mb-4 bg-light rounded-3 text-light bg-dark">
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? "book" : "books"
              }:`
            : "You have no saved books!"}
        </h2>
        <div className="d-flex flex-wrap justify-content-center">
          {userData.savedBooks.map((book) => (
            <Card key={book.bookId} className="m-2" style={{ width: '18rem' }}>
              {book.image && (
                <Card.Img
                  src={book.image}
                  alt={`The cover for ${book.title}`}
                  variant="top"
                />
              )}
              <Card.Body>
                <Card.Title>{book.title}</Card.Title>
                <p className="small">Authors: {book.authors}</p>
                <Card.Text>{book.description}</Card.Text>
                <Button
                  className="btn-block btn-danger"
                  onClick={() => handleDeleteBook(book.bookId)}
                >
                  Delete this Book!
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>
      </Container>
    </>
  );
};

export default SavedBooks;
