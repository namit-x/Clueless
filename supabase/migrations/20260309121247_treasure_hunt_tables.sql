-- Routes
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- Locations
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    answer TEXT NOT NULL
);

-- Multiple clues per location
CREATE TABLE location_clues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    clue TEXT NOT NULL
);

-- Locations inside a route
CREATE TABLE route_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    location_id UUID REFERENCES locations(id),
    clue TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    UNIQUE(route_id, round_number)
);

-- Assign route to team
CREATE TABLE team_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT now(),
    UNIQUE(team_id)
);