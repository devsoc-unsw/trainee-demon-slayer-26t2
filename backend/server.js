import express from 'express';
const PORT = process.env.PORT || 3000;
// const swaggerUi = require('swagger-ui-express');
import swaggerUi from 'swagger-ui-express'
// const YAML = require('yamljs');
import YAML from 'yamljs'
import path from 'path'
import { fileURLToPath } from 'url';
// import authRouter from './routes/auth.routes.js';
import { changePassword, deleteAccount, login, logout, signup } from './auth.js';
import { createEvent, deleteEvent, editEvent, getEvents } from './calendar.js';
import {
  getApplied,
  getOnlineAssessments,
  getInterviews,
  getBehaviouralInterviews,
  getTechnicalInterviews,
  getOffers,
  getDeclined,
  getRejections,
  getCompanies,
  getRoles,
  getCompanyTypes,
  getResponseTime,
  getApplicationsByDay,
} from './analytics.js';

// const path = require('path');

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

// Middleware to parse JSON request bodies
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());
// app.use('/auth', authRouter);

// AUTH ROUTES /////////////////////////////////////////////////////////////////
app.post('/user/auth/signup', signup);
app.post('/user/auth/login', login);
app.post('/user/auth/logout', logout);
app.delete('/user/auth/account', deleteAccount);
app.patch('/user/auth/change-password', changePassword);

// CALENDAR ////////////////////////////////////////////////////////////////////
app.get('/calendar/events', getEvents);
app.post('/calendar/create-event', createEvent);
app.delete('/calendar/delete-event/:id', deleteEvent);
app.patch('/calendar/edit-event/:id', editEvent);


// ANALYTICS ///////////////////////////////////////////////////////////////////
app.get('/analytics/applied', getApplied);
app.get('/analytics/oa', getOnlineAssessments);
app.get('/analytics/interviews', getInterviews);
app.get('/analytics/interviews/behavioural', getBehaviouralInterviews);
app.get('/analytics/interviews/technical', getTechnicalInterviews);
app.get('/analytics/offers', getOffers);
app.get('/analytics/declined', getDeclined);
app.get('/analytics/rejections', getRejections);
app.get('/analytics/companies', getCompanies);
app.get('/analytics/roles', getRoles);
app.get('/analytics/company-types', getCompanyTypes);
app.get('/analytics/response-time/:id', getResponseTime);
app.get('/analytics/applications-by-day', getApplicationsByDay);


app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
