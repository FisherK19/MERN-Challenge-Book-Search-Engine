const express = require("express");
const path = require("path");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require("./utils/auth");
const db = require("./config/connection");

// Initialize the Apollo server with type definitions, resolvers, and context middleware for authentication
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
});

// Function to start the server, asynchronous to ensure middleware and database are loaded properly
async function startApolloServer() {
    const app = express();

    // Middleware to parse JSON and urlencoded data
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // Serve static assets from the React build directory in production mode
    if (process.env.NODE_ENV === "production") {
        app.use(express.static(path.join(__dirname, '../client/dist')));
    }

    // Ensure the database is connected before starting the server
    await server.start();  // <--- Await server start here
    server.applyMiddleware({ app });

    // Catch-all handler to serve the index.html file for non-API requests in production
    app.get('*', (req, res) => {
        const indexPath = path.join(__dirname, '../client/dist/index.html');
        console.log(`Serving index.html from: ${indexPath}`); // Logging the path for debugging
        res.sendFile(indexPath);
    });

    // Ensure the database is connected before starting the server
    db.once("open", () => {
        app.listen({ port: process.env.PORT || 3001 }, () => {
            console.log(`🚀 Server ready at http://localhost:${process.env.PORT || 3001}${server.graphqlPath}`);
        });
    });
}

// Start the server
startApolloServer();
