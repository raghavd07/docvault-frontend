# DocVault - Client Application

This directory contains the frontend client application for the **DocVault** file-sharing system. It is built using React.js and styled with Tailwind CSS. The application provides intuitive dashboards for students, faculty, and administrators to interact with the system, manage files, courses, and user roles.

## Environment Variables

Before running the client application, you need to set up the appropriate environment variables.

Create a `.env` file in the root of the `client` directory (or modify the existing one) and configure the backend API URL:

```env
# URL for your backend API
# Use http://localhost:5000 for local development
REACT_APP_API_URL=http://localhost:5000

# For production, uncomment and use your deployed backend URL:
# REACT_APP_API_URL=https://your-production-backend-url.com
```

## Installation & Setup Steps

Follow these steps to install the dependencies and run the client locally:

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   Using npm:
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   This will run the app in the development mode.
   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
   The page will reload when you make changes.

4. **Build for production:**
   ```bash
   npm run build
   ```
   This builds the app for production to the `build` folder, optimizing the build for the best performance.
