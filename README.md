# FF Tournament Manager

A comprehensive Free Fire tournament management system with three independent projects: backend API, admin panel, and user panel.

## Features

- **Tournament Management**: Create and manage tournaments with different game modes (Squad, Duo, Solo)
- **Team Registration**: Register teams with captains and players
- **Player Management**: Manage player profiles, game IDs, and statistics
- **Match Tracking**: Track match results, kills, placements, and calculate points
- **Leaderboards**: View tournament standings and team rankings
- **Authentication**: Secure user authentication for organizers and admins

## Project Structure

```
FF-Tournament/
├── backend-api/         # NestJS API (port 3001)
├── admin-panel/         # Next.js Admin Dashboard (port 3002)
├── user-panel/          # Next.js User Portal (port 3000)
└── README.md
```

## Tech Stack

### Backend API (NestJS)
- Node.js
- NestJS Framework
- PostgreSQL with TypeORM
- JWT Authentication
- Redis for caching
- Bull for job queues
- Socket.IO for real-time features
- Stripe & SSLCommerz for payments
- AWS S3 for file storage

### Admin Panel (Next.js)
- Next.js 14
- React 18
- TailwindCSS
- Lucide React Icons
- Axios
- Socket.IO Client
- Zustand for state management

### User Panel (Next.js)
- Next.js 14
- React 18
- TailwindCSS
- Lucide React Icons
- Axios
- Socket.IO Client
- Zustand for state management

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (installed locally or cloud database)
- Redis (for caching and job queues)
- npm or yarn

### Backend API Setup

1. Navigate to the backend-api directory:
```bash
cd backend-api
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=ff_tournament
JWT_SECRET=your-jwt-secret
PORT=3001
```

4. Start the backend server:
```bash
npm run start:dev
```

The backend API will run on `http://localhost:3001/api`

### Admin Panel Setup

1. Navigate to the admin-panel directory:
```bash
cd admin-panel
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. Start the development server:
```bash
npm run dev
```

The admin panel will run on `http://localhost:3002`

### User Panel Setup

1. Navigate to the user-panel directory:
```bash
cd user-panel
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. Start the development server:
```bash
npm run dev
```

The user panel will run on `http://localhost:3000`

## Running All Projects

To run all three projects simultaneously, open three terminal windows:

```bash
# Terminal 1 - Backend API
cd backend-api
npm run start:dev

# Terminal 2 - Admin Panel
cd admin-panel
npm run dev

# Terminal 3 - User Panel
cd user-panel
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/:id` - Get single tournament
- `POST /api/tournaments` - Create tournament
- `PUT /api/tournaments/:id` - Update tournament
- `DELETE /api/tournaments/:id` - Delete tournament

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get single team
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Players
- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get single player
- `POST /api/players` - Create player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get single match
- `POST /api/matches` - Create match
- `PUT /api/matches/:id` - Update match
- `DELETE /api/matches/:id` - Delete match

## Pages

- **Home**: Landing page with tournament overview
- **Tournaments**: List of all tournaments
- **Tournament Details**: Detailed view of a tournament with standings
- **Teams**: List of all registered teams
- **Players**: List of all registered players
- **Matches**: List of all matches
- **Login**: User login page
- **Register**: User registration page

## Development

### Adding New Features

1. **Backend**: Add new routes in the `routes/` directory and models in `models/`
2. **Frontend**: Add new pages in `src/pages/` and components in `src/components/`

### Database Models

- **Tournament**: Tournament details, teams, matches, status
- **Team**: Team name, captain, players, statistics
- **Player**: Player info, game ID, team, statistics
- **Match**: Match details, results, MVP
- **User**: User authentication and roles

## Future Enhancements

- Real-time match updates
- Live leaderboard
- Tournament bracket visualization
- Payment integration for entry fees
- Mobile app version
- Advanced analytics and statistics

## License

ISC

## Support

For issues and questions, please contact the development team.
