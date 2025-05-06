# CampusCove

CampusCove is a comprehensive platform designed to simplify campus living for students by providing a centralized hub for hostel bookings, mess subscriptions, and other campus facilities.

## Features

- **User Authentication** - Secure login and registration system with role-based access
- **Dashboard Systems** - Separate dashboards for students and facility owners (hostel, mess, gym)
- **Booking Management** - Reserve hostel rooms and subscribe to mess services
- **Profile Management** - Comprehensive profile management for both students and facility owners
- **Service Management** - Complete management systems for hostels, mess facilities, and gyms
- **Document Management** - Upload and manage important documents for verification
- **Responsive Design** - Mobile-friendly interface built with React and Tailwind CSS

## Tech Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- Tailwind CSS for styling
- React Hot Toast for notifications
- FontAwesome and React Icons for UI elements
- Cloudinary for image storage and management

### Backend
- Node.js with Express
- MongoDB with Mongoose for data modeling
- JWT for authentication
- bcrypt for password hashing
- Cookie-based authentication
- Multer for file uploads
- Cloudinary for image storage

## Project Structure

### Frontend Structure
```
Frontend/
├── public/              # Static assets
├── scripts/             # Build scripts
├── src/
│   ├── Components/      # Reusable UI components
│   │   ├── Landingpage/ # Landing page components
│   │   ├── ServiceConsumers/  # Components for students
│   │   ├── ServiceProviders/  # Components for service providers
│   │   │   ├── AllCustomers.jsx        # Customers management
│   │   │   ├── Bookings.jsx            # Bookings management
│   │   │   ├── DashboardHeader.jsx     # Header for provider dashboard
│   │   │   ├── OwnerDashboard.jsx      # Main dashboard for providers
│   │   │   ├── OwnerSidebar.jsx        # Sidebar navigation for providers
│   │   │   ├── Revenew.jsx             # Revenue management
│   │   │   └── ServiceManagement.jsx   # Service management (hostels, mess, gym)
│   │   ├── dashboard/   # Dashboard components
│   │   └── protected/   # Protected route components
│   ├── context/         # React context for state management
│   ├── layouts/         # Layout components (PublicLayout, DashboardLayout)
│   ├── pages/           # Main page components
│   ├── WrapperContainers/ # Higher-order components
│   ├── App.jsx          # Main application component
│   ├── config.js        # App configuration
│   ├── index.css        # Global CSS
│   ├── main.jsx         # Application entry point
│   └── routes.jsx       # Application routes
├── index.html           # HTML entry point
├── package.json         # Frontend dependencies
└── tailwind.config.js   # Tailwind CSS configuration
```

### Backend Structure
```
Backend/
├── config/              # Configuration files
│   └── database.js      # Database connection
├── Controllers/         # Request handlers
│   ├── authController.js        # Authentication controller
│   ├── hostelRoomController.js  # Hostel room management
│   ├── messController.js        # Mess service management
│   ├── gymController.js         # Gym service management
│   ├── ownerProfileController.js # Owner profile management
│   └── studentProfileController.js # Student profile management
├── middleware/          # Express middleware
│   ├── auth.js          # Authentication middleware
│   └── upload.js        # File upload middleware (Multer)
├── Models/              # Database models
│   ├── user.js          # User model
│   ├── hostelRoom.js    # Hostel room model
│   ├── mess.js          # Mess service model
│   ├── gym.js           # Gym service model
│   ├── ownerProfile.js  # Owner profile model
│   └── studentProfile.js # Student profile model
├── routes/              # API routes
│   ├── authRoutes.js    # Authentication routes
│   ├── hostelRoomRoutes.js # Hostel room routes
│   ├── messRoutes.js    # Mess service routes
│   ├── gymRoutes.js     # Gym service routes
│   ├── ownerRoutes.js   # Owner profile routes
│   └── studentRoutes.js # Student profile routes
├── uploads/             # Temporary storage for uploads
├── utils/               # Utility functions
│   ├── cloudinary.js    # Cloudinary integration
│   └── errorHandler.js  # Error handling
├── index.js             # Server entry point
└── package.json         # Backend dependencies
```

## Routes

### Frontend Routes

Each frontend route renders specific React components:

- `/` - Home page displaying information about various campus facilities
  - Rendered components: FacilitiesList, HostelBookingInfo, MovingSlogan, MessBookingInfo, OtherInfos
  - Purpose: Showcases available campus facilities and booking options

- `/about` - About CampusCove
  - Rendered component: AboutCampusCove
  - Purpose: Provides information about the platform's mission and services

- `/faq` - Frequently asked questions
  - Rendered component: FAQ
  - Purpose: Answers common queries about platform usage

- `/contact` - Contact information
  - Rendered component: Contact
  - Purpose: Provides contact details and potentially a contact form

- `/login` - User login
  - Rendered component: Login
  - Purpose: Authentication form for existing users
  - On successful login: Redirects to appropriate dashboard based on user role

- `/register` - User registration
  - Rendered component: Register
  - Purpose: Registration form for new users
  - Expected inputs: Username, email, password, user type (student/owner type)
  - On successful registration: Redirects to login

- `/student-dashboard` - Student dashboard (protected)
  - Access: Restricted to users with 'student' role
  - Rendered component: StudentDashboard
  - Purpose: Provides booking management and student-specific features
  - Subpath: `/student-dashboard/profile` - User profile management

- `/owner-dashboard` - Facility owner dashboard (protected)
  - Access: Restricted to users with 'hostelOwner', 'messOwner', or 'gymOwner' roles
  - Rendered component: OwnerDashboard
  - Purpose: Facility management dashboard for owners
  - Subpath: `/owner-dashboard/profile` - Owner profile management
  - Subpath: `/owner-dashboard/services` - Service management (hostel rooms, mess, gym)
  - Subpath: `/owner-dashboard/bookings` - Booking management
  - Subpath: `/owner-dashboard/all-customers` - Customer management
  - Subpath: `/owner-dashboard/revenew` - Revenue management

### Backend API Routes

The backend API serves JSON responses with the following endpoints:

#### Authentication Routes
- **POST `/api/auth/register`** - Register a new user
- **POST `/api/auth/login`** - Login user
- **GET `/api/auth/profile`** - Get user profile (protected)
- **GET `/api/auth/me`** - Get current user (protected)

#### Hostel Room Routes
- **GET `/api/hostel-rooms`** - Get all hostel rooms (public)
- **POST `/api/hostel-rooms`** - Create a new hostel room (protected, hostelOwner only)
- **GET `/api/hostel-rooms/owner`** - Get all rooms for the current owner (protected, hostelOwner only)
- **GET `/api/hostel-rooms/:id`** - Get a specific hostel room (public)
- **PUT `/api/hostel-rooms/:id`** - Update a hostel room (protected, hostelOwner only)
- **DELETE `/api/hostel-rooms/:id`** - Delete a hostel room (protected, hostelOwner only)
- **DELETE `/api/hostel-rooms/:id/images/:imageId`** - Delete a specific image from a hostel room (protected, hostelOwner only)

#### Mess Routes
- **GET `/api/mess`** - Get all mess listings (public)
- **POST `/api/mess`** - Create a new mess listing (protected, messOwner only)
- **GET `/api/mess/owner`** - Get all mess listings for the current owner (protected, messOwner only)
- **GET `/api/mess/:id`** - Get a specific mess listing (public)
- **PUT `/api/mess/:id`** - Update a mess listing (protected, messOwner only)
- **DELETE `/api/mess/:id`** - Delete a mess listing (protected, messOwner only)
- **DELETE `/api/mess/:id/images/:imageId`** - Delete a specific image from a mess listing (protected, messOwner only)

#### Gym Routes
- **GET `/api/gym`** - Get all gym listings (public)
- **POST `/api/gym`** - Create a new gym listing (protected, gymOwner only)
- **GET `/api/gym/owner`** - Get all gym listings for the current owner (protected, gymOwner only)
- **GET `/api/gym/:id`** - Get a specific gym listing (public)
- **PUT `/api/gym/:id`** - Update a gym listing (protected, gymOwner only)
- **DELETE `/api/gym/:id`** - Delete a gym listing (protected, gymOwner only)
- **DELETE `/api/gym/:id/images/:imageId`** - Delete a specific image from a gym listing (protected, gymOwner only)

#### Owner Profile Routes
- **GET `/api/owner/profile`** - Get owner profile (protected, owners only)
- **POST `/api/owner/profile`** - Create owner profile (protected, owners only)
- **PUT `/api/owner/profile`** - Update owner profile (protected, owners only)
- **GET `/api/owner/profile/status`** - Get profile completion status (protected, owners only)
- **GET `/api/owner/profile/completion-steps`** - Get profile completion steps (protected, owners only)
- **PUT `/api/owner/profile/personal`** - Update personal information (protected, owners only)
- **PUT `/api/owner/profile/business`** - Update business information (protected, owners only)
- **PUT `/api/owner/profile/payment`** - Update payment information (protected, owners only)
- **PUT `/api/owner/profile/preferences`** - Update preferences (protected, owners only)
- **PUT `/api/owner/profile/services`** - Update services (protected, owners only)
- **PUT `/api/owner/profile/property`** - Update property details (protected, owners only)
- **PUT `/api/owner/profile/picture`** - Upload profile picture (protected, owners only)
- **GET `/api/owner/profile/documents`** - Get documents (protected, owners only)
- **POST `/api/owner/profile/documents`** - Upload documents (protected, owners only)
- **DELETE `/api/owner/profile/documents/:id`** - Delete document (protected, owners only)

#### Student Profile Routes
- **GET `/api/student/details`** - Get all user details (account + profile) (protected, students only)
- **GET `/api/student/profile`** - Get student profile (protected, students only)
- **POST `/api/student/profile`** - Create student profile (protected, students only)
- **PUT `/api/student/profile`** - Update student profile (protected, students only)
- **GET `/api/student/profile/status`** - Get profile completion status (protected, students only)
- **GET `/api/student/profile/completion-steps`** - Get profile completion steps (protected, students only)
- **PUT `/api/student/profile/picture`** - Upload profile picture (protected, students only)
- **PUT `/api/student/profile/personal`** - Update personal information (protected, students only)
- **PUT `/api/student/profile/academic`** - Update academic information (protected, students only)
- **PUT `/api/student/profile/payment`** - Update payment information (protected, students only)
- **PUT `/api/student/profile/preferences`** - Update preferences (protected, students only)
- **POST `/api/student/profile/documents`** - Upload documents (protected, students only)
- **DELETE `/api/student/profile/documents/:id`** - Delete document (protected, students only)

## Deployment

- **Backend:** Deployed on Render.com at `https://campus-cove.onrender.com`
- **Frontend:** Deployed on Vercel

## License
ISC - as specified in the backend package.json
