# Job Hunt Hub - Backend API

Node.js Express backend for the Job Hunt Hub dashboard with MongoDB integration.

## Features

- **Applications Management**: Track job applications with status, dates, and contacts
- **Resumes Management**: Store and manage multiple resumes with default selection
- **Reminders**: Set and track interview reminders and follow-ups
- **Job Listings**: Search and bookmark job postings
- **RESTful API**: Clean API endpoints for all resources
- **MongoDB Integration**: Persistent data storage with Mongoose ODM

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables** in `.env`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/job-hunt-hub
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_here
   ```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Applications
- `GET /api/applications` - Get all applications
- `GET /api/applications/:id` - Get single application
- `GET /api/applications/stats` - Get application statistics
- `POST /api/applications` - Create new application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

### Resumes
- `GET /api/resumes` - Get all resumes
- `GET /api/resumes/:id` - Get single resume
- `POST /api/resumes` - Create new resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume
- `PATCH /api/resumes/:id/default` - Set as default resume

### Reminders
- `GET /api/reminders` - Get all reminders
- `GET /api/reminders/:id` - Get single reminder
- `POST /api/reminders` - Create new reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder
- `PATCH /api/reminders/:id/complete` - Mark as completed

### Job Listings
- `GET /api/job-listings` - Get all job listings (supports query params: search, location, source)
- `GET /api/job-listings/:id` - Get single job listing
- `POST /api/job-listings` - Create new job listing
- `PUT /api/job-listings/:id` - Update job listing
- `DELETE /api/job-listings/:id` - Delete job listing
- `PATCH /api/job-listings/:id/bookmark` - Toggle bookmark

## Data Models

### Application
- jobTitle (string, required)
- company (string, required)
- status (enum: applied, interviewing, offered, rejected, withdrawn)
- appliedDate (date)
- jobUrl (string)
- salary (string)
- location (string)
- notes (string)
- contacts (array of objects with name, position, email, phone)
- interviewDates (array of dates)

### Resume
- title (string, required)
- filename (string, required)
- fileUrl (string)
- fileSize (number)
- isDefault (boolean)

### Reminder
- title (string, required)
- description (string)
- reminderDate (date, required)
- type (enum: interview, followup, deadline, other)
- applicationId (reference to Application)
- isCompleted (boolean)

### JobListing
- title (string, required)
- company (string, required)
- description (string)
- location (string)
- salary (string)
- jobUrl (string, required)
- source (enum: linkedin, indeed, glassdoor, other)
- skills (array of strings)
- isBookmarked (boolean)

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── controllers/        # Request handlers
│   │   ├── applicationController.js
│   │   ├── resumeController.js
│   │   ├── reminderController.js
│   │   └── jobListingController.js
│   ├── models/            # Mongoose schemas
│   │   ├── Application.js
│   │   ├── Resume.js
│   │   ├── Reminder.js
│   │   └── JobListing.js
│   ├── routes/            # API routes
│   │   ├── applications.js
│   │   ├── resumes.js
│   │   ├── reminders.js
│   │   └── jobListings.js
│   ├── middleware/        # Custom middleware
│   └── server.js          # Express app entry point
├── package.json
├── .env.example
└── .gitignore
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/job-hunt-hub |
| NODE_ENV | Environment (development/production) | development |
| JWT_SECRET | JWT signing secret | (required for auth) |

## CORS Configuration

The API accepts requests from:
- All origins in development mode
- Specified frontend URL in production (update in `server.js`)

## Error Handling

All endpoints return consistent error responses:
```json
{
  "error": "Error message",
  "message": "Additional details (optional)"
}
```

## Future Enhancements

- [ ] JWT authentication
- [ ] User accounts and profiles
- [ ] File upload for resumes
- [ ] Email notifications
- [ ] Job scraping integration
- [ ] Interview preparation resources
- [ ] Analytics and insights

## Contributing

1. Create a new branch for features
2. Follow existing code patterns
3. Test all endpoints before submitting

## License

MIT
