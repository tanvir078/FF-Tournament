# ArenaHub Tournament Platform

A multi-game esports tournament management system with Laravel API, management panel, user web, and Expo mobile clients.

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
├── ff-backend-api/      # Laravel API (port 8000)
├── admin-panel/         # Next.js Admin Dashboard (port 3002)
├── user-panel/          # Next.js User Portal (port 3000)
└── README.md
```

## Tech Stack

### Backend API (Laravel)
- PHP 8.3+
- Laravel Framework
- PostgreSQL
- Laravel Sanctum token authentication

### Admin Panel (Next.js)
- Next.js 14
- React 18
- TailwindCSS
- Lucide React Icons
- Axios
- Laravel Echo + Reverb
- Zustand for state management

### User Panel (Next.js)
- Next.js 14
- React 18
- TailwindCSS
- Lucide React Icons
- Axios
- Laravel Echo + Reverb
- Zustand for state management

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PHP 8.3 or higher
- Composer
- PostgreSQL (installed locally or cloud database)
- npm or yarn

### Backend API Setup

1. Navigate to the Laravel backend directory:
```bash
cd ff-backend-api
```

2. Install dependencies:
```bash
composer install
```

3. Configure environment variables in `.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ff_tournament
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

4. Prepare and start the backend:
```bash
php artisan key:generate
php artisan migrate
php artisan serve --port=8000
```

The backend API will run on `http://127.0.0.1:8000/api`

### ArenaHub Additive Migration And Runtime Services

Deploy the catalog migration before updated clients:

```bash
cd ff-backend-api
php artisan migrate --force
php artisan reverb:start
php artisan queue:work
php artisan schedule:work
```

The migration seeds Free Fire, PUBG Mobile, eFootball, and Mobile Legends. Existing tournaments, teams, and UID/IGN values are backfilled to Free Fire without resetting wallet or transaction records. Admins manage catalog entries from `/admin/games`, verify identities from `/admin/game-profiles`, and update branding from `/admin/settings`.

The scheduler runs `tournaments:expire-check-ins` every minute so missed captain check-ins release their registration slots.

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
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
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
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
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
cd ff-backend-api
php artisan serve --port=8000

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
- `POST /api/auth/admin/login` - Login admin
- `GET /api/auth/profile` - Get authenticated profile

### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/:id` - Get single tournament
- `POST /api/tournaments` - Create tournament
- `PUT /api/tournaments/:id` - Update tournament
- `POST /api/tournaments/:id/join` - Join tournament

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get single team
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Users
- `GET /api/users/profile` - Get authenticated user profile
- `PUT /api/users/profile` - Update authenticated user profile
- `PUT /api/users/change-password` - Change user password

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get single match
- `POST /api/matches` - Create match

### Wallet
- `GET /api/wallet` - Get authenticated user wallet
- `POST /api/wallet/deposit` - Submit deposit request

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

1. **Backend**: Add new routes in `ff-backend-api/routes/` and models in `ff-backend-api/app/Models/`
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
# FF Tournament Platform

## Local Services

- Laravel API: `cd ff-backend-api && php artisan serve --port=8000`
- Queue worker: `cd ff-backend-api && php artisan queue:work`
- Reverb WebSocket server: `cd ff-backend-api && php artisan reverb:start`
- Scheduler: `cd ff-backend-api && php artisan schedule:work`
- User web: `cd user-panel && npm run dev`
- Management panel: `cd admin-panel && npm run dev`
- Expo app: set `EXPO_PUBLIC_API_URL` to the computer LAN IP with port `8000`, then run `npm start`.

Tournament entry fees are wallet-only. Users add money with a transaction ID, admins verify deposits, and approved result claims credit individual user wallets. Support messages are persisted first and broadcast over private Reverb channels.
