const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const morgan = require('morgan');
const bodyParser = require('body-parser');

const estimatorRoutes = require('./src/routes/estimator');

app.use(
  morgan(
    (tokens, req, res) => {
      let responseTime = parseInt(
        tokens['response-time'](req, res),
        10
      ).toString();

      if (responseTime.length === 1) responseTime = `0${responseTime}`;

      const logStr = [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        responseTime
      ].join('\t\t');

      return `${logStr}ms`;
    },
    {
      stream: fs.createWriteStream(path.join(__dirname, 'logs.txt'), {
        flags: 'a'
      })
    }
  )
);

app.use(morgan('tiny'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes to handle requests
app.use('/api/v1/on-covid-19', estimatorRoutes);

// Error Handler
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

/* eslint-disable no-unused-vars */
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});
/* eslint-disable no-unused-vars */
module.exports = app;
