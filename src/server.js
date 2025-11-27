require('dotenv').config();

const fs = require('fs');
console.log('cwd =', process.cwd());
console.log('.env exists =', fs.existsSync('.env'));
console.log('MONGO_URI (env) =', process.env.MONGO_URI);

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowRoutes = require('./routes/borrowRoutes');

const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const { decrypt } = require('./utils/tokenEncrypt');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());


console.log('MONGO_URI =', process.env.MONGO_URI);


connectDB(process.env.MONGO_URI);

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err.message);
  res.status(res.statusCode && res.statusCode !== 200 ? res.statusCode : 500).json({
    message: err.message || 'Internal server error'
  });
});

async function startApollo() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      try {
        const encryptionKey = process.env.TOKEN_ENCRYPTION_KEY;
        let tokenEncrypted = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
          tokenEncrypted = req.headers.authorization.split(' ')[1];
        }
        if (tokenEncrypted) {
          const token = decrypt(tokenEncrypted, encryptionKey);
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.id).select('-password');
          if (user) req.user = user;
        }
      } catch (e) {
        
      }
      return { req };
    }
  });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
}

startApollo();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
