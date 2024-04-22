import React, { useState, useEffect } from "react";
import {
  Container,
  Col,
  Form,
  Button,
  Card,
} from "react-bootstrap";
import { useMutation } from "@apollo/client";

import Auth from "../utils/auth";
import { searchGoogleBooks } from "../utils/API";
import { saveBookIds, getSavedBookIds } from "../utils/localStorage";
import { SAVE_BOOK } from "../utils/mutation";

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());
  const [saveBook] = useMutation(SAVE_BOOK);

  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  });

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!searchInput) {
      return false;
    }
    try {
      const response = await searchGoogleBooks(searchInput);
      if (!response.ok) {
        throw new Error("something went wrong!");
      }
      const { items } = await response.json();
      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ["No author to display"],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || "",
      }));
      setSearchedBooks(bookData);
      setSearchInput("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBook = async (bookId) => {
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) {
      return false;
    }
    try {
      await saveBook({
        variables: { ...bookToSave },
      });
      setSavedBookIds([...savedBookIds, bookToSave.bookId]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="p-5 mb-4 bg-light rounded-3">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Form.Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name="searchInput"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="text"
                  size="lg"
                  placeholder="Search for a book"
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type="submit" variant="success" size="lg">
                  Submit Search
                </Button>
              </Col>
            </Form.Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : "Search for a book to begin"}
        </h2>
        <div className="d-flex flex-wrap justify-content-center">
          {searchedBooks.map((book) => (
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
                {Auth.loggedIn() && (
                  <Button
                    disabled={savedBookIds.includes(book.bookId)}
                    className="btn-block btn-info"
                    onClick={() => handleSaveBook(book.bookId)}
                  >
                    {savedBookIds.includes(book.bookId)
                      ? "This book has already been saved!"
                      : "Save this Book!"}
                  </Button>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      </Container>
    </>
  );
};

export default SearchBooks;
