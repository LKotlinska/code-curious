# Gamified Programming Tutorial Web App

This is a web application designed to introduce users to basic programming concepts through a gamified experience. Users interact with visual code blocks to influence a physics-based simulation, making programming concepts more accessible and fun!

## Features

- **Visual Code Blocks**: Users can drag and drop blocks to build simple code sequences.
- **Interactive Physics Simulations**: See immediate feedback as the code manipulates shapes and colors in a real-time physics environment.
- **Lessons**: Guided tutorials to introduce key programming concepts like variables, data types, and basic logic.
- **Responsive Design**: Optimized for desktop, with support for tablet and mobile views.

---

## Installation

Follow these steps to clone the repository and run the app locally:

### 1. Prerequisites

- **Node.js** (v16 or higher recommended)
- **npm** (or `pnpm`/`yarn`, if preferred)
- **Supabase account** (for backend database setup)

### 2. Clone the Repository

```bash
git clone https://github.com/yourusername/repo-name.git
cd repo-name
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment Variables

Create a `.env` file in the root of your project and provide your Supabase configuration. You’ll need:

- `VITE_SUPABASE_URL:` Your Supabase project URL.
- `VITE_SUPABASE_ANON_KEY:` Your Supabase anonymous public key.

Example `.env file:`

```bash
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Database Configuration

Set up the following tables in your Supabase project:

#### `lessons` Table

| Column Name | Type  | Notes                                                 |
| ----------- | ----- | ----------------------------------------------------- |
| id          | int8  | Primary key, auto-incrementing                        |
| slug        | text  | Unique identifier for lessons                         |
| title       | text  | Lesson title                                          |
| content     | jsonb | Lesson content in Markdown, as array of strings       |
| prev_lesson | text  | Used to display link                                  |
| next_lesson | text  | Used to display link                                  |
| snapshot    | jsonb | Holds any default code to be displayed in Editor      |
| scene       | text  | Holds any default bodies to be displayed in Playfield |

Please refer to `DATABASE.md` for more detailed `lessons` table example.

#### `snapshots` Table

| Column Name   | Type  | Notes                                      |
| ------------- | ----- | ------------------------------------------ |
| id            | int8  | Primary key, auto-incrementing             |
| user_id       | uuid  | User ID (foreign key → `auth.users.id`)    |
| lesson_slug   | text  | Lesson slug (foreign key → `lessons.slug`) |
| snapshot_data | jsonb | Saved user-created code, lesson-specific   |

**Constraints required:** Add a composite unique constraint on (`user_id`, `lesson_slug`), as this table is upserted via `onConflict: 'user_id,lesson_slug'`, so Postgres needs a real unique constraint to resolve conflicts:

```
alter table snapshots
add constraint snapshots_user_lesson_unique unique (user_id, lesson_slug);
```

### 6. Run the Development Server

Once your database is ready, start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser to use the app.

### 7. Contributing

We are not open to contributions for the time being.

### 8. License

MIT License
