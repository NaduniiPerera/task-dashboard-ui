 Task Dashboard UI

This is the frontend application for the Task Management System developed for the Bloomtech Junior Web Developer Intern Technical Assessment.

The application is built using React, TypeScript, Vite, and Tailwind CSS. It connects with the Lab 1 Task Management REST API backend.

## GitHub Repositories

Backend API Repository:  
https://github.com/NaduniiPerera/task-management-api

Frontend UI Repository:  
https://github.com/NaduniiPerera/task-dashboard-ui

Live Deployed URL:  
https://idyllic-horse-c2284e.netlify.app/

## Technologies Used

* React
* TypeScript
* Vite
* Tailwind CSS
* REST API integration
* JWT authentication
* Local Storage
* Git and GitHub
* Netlify deployment
* Vitest for unit testing

## Main Features

* User registration and login using JWT authentication
* Logged-in user name display on the dashboard
* Task list displayed in a responsive card layout
* Color-coded status badges
* Priority display for each task
* Created date display for each task
* Filter tasks by status
* Filter tasks by priority
* Add new task using a modal form
* Edit existing task using the same form component
* Delete task with confirmation
* Empty state when no tasks are available
* Kanban board view with columns for each status
* Drag and drop task movement between Kanban columns
* Optimistic UI updates
* Dark mode toggle with localStorage persistence
* Responsive layout for mobile and desktop screens
* Unit tests for task utility functions

## Backend API Requirement

This frontend connects to the Lab 1 backend API running at:

```txt
http://localhost:3000

The backend must be running before using this frontend locally.

Backend repository:

https://github.com/NaduniiPerera/task-management-api

Backend start commands:

cd "D:\Task Management API"
npm install
npm start

Expected backend output:

Server is running on port 3000
Frontend Setup Instructions

Clone the frontend repository:

git clone https://github.com/NaduniiPerera/task-dashboard-ui.git

Go into the project folder:

cd task-dashboard-ui

Install dependencies:

npm install

Run the frontend:

npm run dev

Open the application in the browser:

http://localhost:5173
How to Use the Application Locally

First, start the Lab 1 backend API server on port 3000.

Then start the Lab 2 frontend using npm run dev.

Create a new account using the register form or log in with an existing account.

After registration or login, the user is taken to the dashboard, where the logged-in user name is displayed.

Users can add, edit, delete, filter, and view tasks in both list view and Kanban view.

API Endpoints Used

The frontend uses the following backend endpoints:

POST /auth/register
POST /auth/login
GET /tasks
POST /tasks
PUT /tasks/:id
DELETE /tasks/:id
Task Data Model

Each task contains the following fields:

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  categoryId?: string;
}
Screenshots

The screenshots below are stored in the project under:

public/screenshots
Login Page

Register Page

Dashboard List View

Add Task Modal

Edit Task Modal

Delete Task Confirmation

Kanban View

Dark Mode

Assessment Requirement Coverage
Core Requirements
Task list view with card layout: Completed
Status badge with color coding: Completed
Priority and created date display: Completed
Filter bar for status and priority: Completed
Add task form using controlled inputs: Completed
Client-side validation before submission: Completed
Edit task using the same form component: Completed
Delete task with confirmation: Completed
Responsive layout for mobile and desktop: Completed
Intermediate Challenges
Kanban board view: Completed
Empty state component: Completed
TypeScript interfaces for data models: Completed
No any types used: Completed
Optimistic UI updates: Completed
Stretch Goals
Dark mode toggle with localStorage persistence: Completed
Deployment to a live URL: Completed
Unit tests using Vitest: Completed
Unit Tests

This project includes unit tests for task utility functions using Vitest.

Run tests:

npm run test

Tested utility features:

Filtering tasks by status and priority
Validating task form input
Formatting readable task status labels

Current test status:

Test Files  1 passed
Tests       3 passed
Build Command

To create a production build:

npm run build

To preview the production build:

npm run preview
Deployment

The frontend is deployed using Netlify.

Live URL:

https://idyllic-horse-c2284e.netlify.app/

Build settings used for deployment:

Build command: npm run build
Publish directory: dist
Important Note

The deployed frontend opens online through Netlify. However, the full login, registration, and task management functionality depends on the backend API.

For local testing, make sure the Lab 1 backend is running at:

http://localhost:3000

If the backend is not running, login, registration, and task operations will not work locally.