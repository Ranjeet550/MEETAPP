# NexusMeet - Professional Video Conferencing App

A modern, secure video conferencing application built with React, Node.js, and Socket.io.

## Features

- 🎥 HD Video Conferencing
- 💬 Real-time Chat
- 🖥️ Screen Sharing
- 🔒 Secure Authentication
- 📱 Responsive Design
- ❄️ Beautiful Animated UI
- 🌐 Cross-platform Support

## Tech Stack

### Frontend (UI)
- React 19
- Vite
- Tailwind CSS
- React Router
- React Icons
- GSAP Animations
- Socket.io Client

### Backend (API)
- Node.js
- Express.js
- MongoDB
- Socket.io
- JWT Authentication
- Bcrypt

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ranjeet550/MEETAPP.git
   cd MEETAPP
   ```

2. **Setup Backend (API)**
   ```bash
   cd API
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm start
   ```

3. **Setup Frontend (UI)**
   ```bash
   cd ../UI
   npm install
   cp .env.example .env
   # Edit .env with your API URL
   npm run dev
   ```

### Environment Variables

#### API/.env
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/your-database-name
JWT_SECRET=your_super_secure_jwt_secret_key_here
```

#### UI/.env
```
VITE_API_URL=http://localhost:5000
```

## Project Structure

```
MEETAPP/
├── API/                 # Backend server
│   ├── config/         # Database configuration
│   ├── controllers/    # Route controllers
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── server.js       # Entry point
├── UI/                 # Frontend application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # API services
│   │   ├── hooks/      # Custom hooks
│   │   └── utils/      # Utilities
│   └── public/         # Static assets
└── README.md
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Environment variable protection
- CORS configuration
- Input validation
- Secure session management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email your-email@example.com or create an issue on GitHub.