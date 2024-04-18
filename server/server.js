const express = require("express");
const path = require("path");
const db = require("./config/connection");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require("./utils/auth");

async function startApolloServer() {
    const app = express();
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: authMiddleware,
    });

    await server.start();  
    server.applyMiddleware({ app });

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // Serve static assets in production
    if (process.env.NODE_ENV === "production") {
        app.use(express.static(path.join(__dirname, "../client/build")));
    }

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../client/build/index.html"));
    });

    db.once("open", () => {
        app.listen({ port: process.env.PORT || 3001 }, () => 
            console.log(`🚀 Server ready at http://localhost:${process.env.PORT || 3001}${server.graphqlPath}`)
        );
    });
}

startApolloServer();
