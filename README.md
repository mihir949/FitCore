# FitCore - Ultimate Fitness Companion

A comprehensive full-stack health and fitness tracking application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Track your workouts, diet, water intake, and earn badges for your fitness achievements.

## Features

### 🏋️ Workout Tracking
- Log different types of workouts (cardio, strength, yoga, running, cycling, swimming)
- Track duration and calories burned
- Upload workout images
- View workout history and analytics
- Date range filtering for workout data

### 🍎 Diet Tracking
- Log meals with calories and meal types (breakfast, lunch, dinner, snack)
- Upload food images
- Daily calorie breakdown with pie charts
- **NEW: Advanced Meal Planner** - Plan meals for the entire week
- **NEW: Meal Summary** - Get daily calorie summaries and meal breakdowns
- **NEW: Enhanced Meal Management** - Edit and delete meals with improved UI

### 💧 Water Intake Tracker
- Track daily water consumption
- Animated water glass icons
- Progress bars with goal tracking
- Weekly water intake analytics
- **NEW: Weekly Water Summary** - Comprehensive weekly hydration reports
- **NEW: Quick Add Glass** - One-click water intake logging

### 🏆 Streaks & Badges
- Track consecutive workout, diet, and water intake days
- Earn badges for achievements
- Motivational messages and progress tracking
- **NEW: Advanced Badge System** - Multiple achievement categories
- **NEW: Badge Management** - View available badges and requirements
- **NEW: Automatic Badge Checking** - Real-time badge awarding

### 👤 Profile Management
- **NEW: Complete User Profiles** - Height, weight, age, and fitness goals
- **NEW: Profile Image Upload** - Upload and manage profile pictures
- **NEW: Editable Profile Information** - Update personal details anytime
- **NEW: Fitness Goals Tracking** - Set and track specific fitness objectives

### ⏰ Reminders & Timers
- **NEW: Workout Alarms** - Set specific workout reminder times
- **NEW: Countdown Timer** - Built-in workout timer with customizable durations
- **NEW: Water Reminders** - Automatic hydration reminders every 2 hours
- **NEW: Browser Notifications** - Desktop notifications for all reminders
- **NEW: Sound Alerts** - Audio notifications for timers and alarms

### 📊 Dashboard & Analytics
- Comprehensive dashboard with daily stats
- Weekly and monthly analytics
- Charts and visualizations
- **NEW: Enhanced Dashboard** - Real-time stats with profile integration
- **NEW: Weekly Data Visualization** - Interactive charts for all metrics
- **NEW: Recent Activity Feed** - Quick view of latest workouts and meals

### 🎨 Dark Theme Design
- Modern black theme with neon accents
- Responsive design for all devices
- Smooth animations and transitions
- Professional card layouts
- **NEW: Enhanced UI Components** - Improved forms, modals, and interactions

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

### Frontend
- **React.js** - Frontend framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **React Chart.js 2** - Chart.js React wrapper
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## Project Structure

```
fitcore/
├── backend/
│   ├── models/          # MongoDB models (User, Workout, Meal, Water, Streak)
│   ├── routes/          # API routes (auth, workouts, diet, water, streaks, upload)
│   ├── middleware/      # Custom middleware (auth.js)
│   ├── uploads/         # Uploaded images (profile pics, workout/food photos)
│   ├── public/          # Static files and badge images
│   ├── config.env       # Environment configuration
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── public/          # Static files (favicon, manifest)
│   ├── src/
│   │   ├── components/  # React components (Navbar)
│   │   ├── pages/       # Page components (Dashboard, Profile, Reminders, etc.)
│   │   ├── contexts/    # React contexts (AuthContext)
│   │   ├── utils/       # Utility functions (api.js)
│   │   ├── App.js       # Main app component
│   │   └── index.css    # Global styles
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── start.bat            # Windows startup script
├── start.sh             # Unix startup script
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fitcore
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

### Quick Start (Using Startup Scripts)

For convenience, you can use the provided startup scripts:

**Windows:**
```bash
start.bat
```

**Unix/Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

These scripts will automatically start both the backend and frontend servers.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with profile data
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile information

### Workouts
- `GET /api/workouts` - Get user workouts (latest 50)
- `GET /api/workouts/range` - Get workouts by date range
- `POST /api/workouts` - Add new workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Diet & Meal Planning
- `GET /api/diet` - Get user meals (latest 50)
- `GET /api/diet/range` - Get meals by date range
- `GET /api/diet/date/:date` - Get meals for specific date
- `GET /api/diet/summary/:date` - Get daily calorie summary
- `POST /api/diet` - Add new meal
- `PUT /api/diet/:id` - Update meal
- `DELETE /api/diet/:id` - Delete meal

### Water Tracking
- `GET /api/water` - Get water intake history (latest 30 days)
- `GET /api/water/range` - Get water intake by date range
- `GET /api/water/today` - Get today's water intake
- `GET /api/water/weekly` - Get weekly water summary
- `POST /api/water` - Update water intake
- `POST /api/water/add-glass` - Add one glass of water

### Streaks & Badges
- `GET /api/streaks` - Get user streaks and badges
- `PUT /api/streaks/update` - Manually update streaks
- `POST /api/streaks/badge` - Add custom badge
- `GET /api/streaks/available-badges` - Get available badge requirements
- `POST /api/streaks/check-badges` - Check and award new badges

### File Upload
- `POST /api/upload` - Upload single image (5MB max)
- `POST /api/upload/multiple` - Upload multiple images (max 5 files)

## Usage

### Getting Started
1. **Register/Login**: Create an account with your personal information (height, weight, age, fitness goals)
2. **Profile Setup**: Upload a profile picture and set your fitness objectives
3. **Dashboard**: View your comprehensive daily stats and weekly analytics

### Core Features
4. **Workouts**: Log your workouts with duration, calories, and images
5. **Diet**: Track your meals and calorie intake with food images
6. **Water**: Monitor your daily water consumption with quick-add functionality
7. **Streaks**: View your progress streaks and earned badges

### Advanced Features
8. **Meal Planner**: Plan your meals for the entire week with the interactive calendar
9. **Reminders & Timers**: 
   - Set workout alarms for specific times
   - Use the built-in countdown timer during workouts
   - Enable automatic water reminders every 2 hours
10. **Profile Management**: Update your personal information, fitness goals, and profile picture anytime
11. **Analytics**: View detailed weekly reports and progress tracking

## Features in Detail

### Dark Theme
- Primary background: Black (#000000)
- Secondary backgrounds: Dark grey shades (#111111, #1a1a1a, #2a2a2a)
- Accent colors: Neon blue (#3a08f1) and neon green (#00ff7f)
- Consistent spacing and rounded corners

### Profile Management
- Complete user profiles with height, weight, age, and fitness goals
- Profile image upload with 5MB file size limit
- Editable profile information with real-time updates
- Fitness goal tracking (weight loss, muscle gain, endurance, general fitness)

### Meal Planning System
- Interactive weekly calendar for meal planning
- Meal categorization (breakfast, lunch, dinner, snack)
- Daily calorie summaries and meal breakdowns
- Drag-and-drop meal management
- Weekly meal overview with total calories

### Reminders & Timers
- Workout alarms with browser notifications
- Countdown timer with customizable durations (15, 30, 45 minutes)
- Water reminders every 2 hours with sound alerts
- Desktop notifications for all reminders
- Audio notifications using browser audio API

### Advanced Badge System
- Multiple achievement categories (workout streaks, meal logging, hydration)
- Automatic badge checking and awarding
- Badge requirements tracking
- Custom badge creation and management

### Image Uploads
- Profile pictures, workout images, and food photos
- Automatic image optimization and storage
- Support for common image formats (JPEG, PNG, GIF, WebP, AVIF)
- Multiple image upload support (up to 5 files)

### Analytics & Charts
- Weekly workout duration charts
- Daily calorie intake breakdowns
- Water intake progress tracking
- Streak visualization
- Real-time dashboard with profile integration
- Recent activity feeds

### Enhanced Data Management
- Date range filtering for all data types
- Weekly and monthly summaries
- Quick-add functionality for water intake
- Enhanced meal management with edit/delete capabilities

### Responsive Design
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interface
- Enhanced UI components with improved interactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the GitHub repository.

---

Built with ❤️ using the MERN stack
