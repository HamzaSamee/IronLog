-- IronLog 3.0: 3rd Normal Form (3NF) Relational Schema

-- 1. Drop existing tables in correct order
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS meal_items CASCADE;
DROP TABLE IF EXISTS meals CASCADE;
DROP TABLE IF EXISTS weight_logs CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS videos CASCADE;

-- 2. Users Table
-- Stores core identity and global fitness plan
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    clerk_id TEXT UNIQUE NOT NULL,
    username TEXT,
    email TEXT,
    goal_type TEXT CHECK (goal_type IN ('weight_gain', 'weight_loss', 'maintenance')),
    current_weight DECIMAL(5,2),
    target_weight DECIMAL(5,2),
    daily_caloric_target INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Weight Logs (For Progress Graphs)
CREATE TABLE weight_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    weight DECIMAL(5,2) NOT NULL,
    log_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(user_id, log_date)
);

-- 4. Friendships (Social Graph)
CREATE TABLE friendships (
    id SERIAL PRIMARY KEY,
    user_id_1 INTEGER REFERENCES users(id) ON DELETE CASCADE,
    user_id_2 INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'accepted', -- 'pending', 'accepted'
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_friendship UNIQUE(user_id_1, user_id_2)
);

-- 5. Messages (Peer-to-Peer Comms)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW()
);

-- 6. Meals (Nutrition Header)
CREATE TABLE meals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    meal_type TEXT, -- 'breakfast', 'lunch', 'dinner', 'snack'
    log_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Meal Items (3NF Detail Table)
-- Normalization: Separating meal instances from specific food items consumed
CREATE TABLE meal_items (
    id SERIAL PRIMARY KEY,
    meal_id INTEGER REFERENCES meals(id) ON DELETE CASCADE,
    food_name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    protein_g DECIMAL(5,2),
    carbs_g DECIMAL(5,2),
    fats_g DECIMAL(5,2)
);

-- 8. Activity Logs (Existing feature, kept for Heatmap)
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_name TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP DEFAULT NOW(),
    end_time TIMESTAMP,
    intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Goals Table (Missions)
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 1,
    deadline TIMESTAMP,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_messages_chat ON messages(sender_id, receiver_id);
CREATE INDEX idx_weight_time ON weight_logs(user_id, log_date);
CREATE INDEX idx_meals_date ON meals(user_id, log_date);
