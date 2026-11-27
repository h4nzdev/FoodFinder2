# FOODFINDER — Simple Presentation Script & Cheat Sheet

Use this guide when presenting **FoodFinder**. Everything is explained in simple, everyday terms so it is easy to speak naturally and answer questions.

---

## PART 1: Opening Introduction (What to Say First)

> "Good day everyone! Today I am presenting **FoodFinder**, a restaurant discovery and route navigation web app built for **Cebu City**.
>
> Instead of using fake or hardcoded restaurant data, FoodFinder pulls **real restaurants, cafés, and fast-food places** from a live map, gives users **real road driving directions** from their location to the restaurant, and lets verified **restaurant owners publish their actual food menus and prices in Philippine Pesos (₱)**."

---

## PART 2: The Tech Stack (In Simple Terms)

When explaining what tools were used to build the project:

### Frontend (What the User Sees)
- **React JS (JSX)** — A JavaScript library used to build the website interface using reusable building blocks called components.
- **Vite** — The tool that runs our local development server and bundles the website so it loads fast.
- **CSS (Neumorphic 60-30-10 Design)** — Used to style the app with a soft 3D "Neumorphic" look using **60% Soft White**, **30% Dark Purple**, and **10% Warm Amber Gold**.
- **Lucide React** — A library of clean icons used for buttons like search, map pins, and directions.
- **Axios** — A tool used to send requests and fetch data from external APIs over the internet.

### Map & Navigation (How Locations & Directions Work)
- **OpenStreetMap (OSM)** — A free, open-source world map (like a free alternative to Google Maps) that provides our map tiles and street layout.
- **Overpass API** — The search engine for OpenStreetMap that lets our app ask for all real restaurants, cafés, and fast-food spots inside Cebu City.
- **Leaflet & React Leaflet** — The map engine that makes the map interactive so users can zoom, pan, click restaurant pins, and see road lines inside React.
- **OSRM (Open Source Routing Machine)** — A free routing service that calculates the actual road path, travel distance in kilometers, travel time in minutes, and turn-by-turn driving directions from the user to the restaurant.

### Backend & Accounts (Where Data is Saved)
- **Supabase Authentication** — Handles sign-up and login for restaurant owners and claim reviewers.
- **Supabase Database (PostgreSQL)** — Stores restaurant ownership claims, reviewer approvals, draft menus, and published menus.
- **Supabase Storage** — Stores the food photos uploaded by restaurant owners for their menu items.

---

## PART 3: Environment Variables (`.env.local`)

> "To keep our configuration clean and avoid hardcoding links inside our components, we store our connection links in environment variables accessed with `import.meta.env`:"

- **`VITE_SUPABASE_URL`** — The web address of our Supabase backend project where our database and login system live.
- **`VITE_SUPABASE_PUBLISHABLE_KEY`** — The public client key that allows our frontend app to talk to Supabase safely (protected by database security rules).
- **`VITE_OVERPASS_URL`** — The API link used to fetch real restaurant locations and details from OpenStreetMap.
- **`VITE_OSRM_URL`** — The API link used to calculate road driving directions, distance, and travel time.

---

## PART 4: The Database Structure (In Simple Terms)

> "Because OpenStreetMap only gives us restaurant locations and basic info—not full food menus—we use **Supabase** so real restaurant owners can claim their restaurant and publish their menu."

### 1. Database Tables
- **`restaurant_claims`** — Stores requests from restaurant owners who want to claim a restaurant on the map. It holds the restaurant ID, restaurant name, their proof of ownership (`evidence`), coordinates, and the status (`pending`, `approved`, or `rejected`).
- **`restaurant_claim_reviewers`** — A small list of trusted user IDs who have permission to review and approve or reject ownership claims.
- **`restaurant_menu_drafts`** — The private workspace table where an approved owner adds or edits their dishes (food name, category, description, price in Pesos, photo URL, and availability) before publishing.
- **`published_restaurant_menus`** — The public table that regular customers see. When an owner clicks **"Publish Menu"**, their draft dishes are copied here so diners can view the verified menu.
- **`published_restaurant_locations` (View)** — A safe public view that shows custom Cebu City restaurant pins added or updated by approved owners.

### 2. Storage Bucket
- **`menu-images`** — A cloud folder in Supabase Storage where approved owners upload real photos of their dishes (up to 5 MB per image).

### 3. Database Functions & Security (Row Level Security / RLS)
- **Row Level Security (RLS)** — Security rules inside the database that make sure:
  - Regular visitors can **only read** published menus.
  - Owners can **only edit** their own restaurant's menu after their claim is `approved`.
  - Owners **cannot approve their own claim** (a separate reviewer must approve it).
- **`set_restaurant_menu_published`** — A database function that checks if the owner is approved, then publishes (or unpublishes) their draft menu to the public page.
- **`is_cebu_city_location`** — A database function that checks if a restaurant's latitude and longitude actually fall inside the Cebu City border.

---

## PART 5: Important Code Variables & State (How the App Works Inside)

If your instructor asks what the main variables in the React code do:

### Restaurant Discovery Variables (`useRestaurants.js` & `Discover.jsx`)
- **`allRestaurants`** — The full list of real Cebu City restaurants fetched from the Overpass API and Supabase.
- **`filteredRestaurants`** — The list of restaurants currently matching the user's search text, category tab, cuisine dropdown, and map view.
- **`selectedRestaurant`** — Holds the specific restaurant that the user clicked on the list or map so we can show its details and menu.
- **`searchQuery`** — What the user types into the search box (like a restaurant name, cuisine, or street).
- **`selectedCategory`** — The active category tab (`All`, `Restaurant`, `Café`, or `Fast Food`).
- **`maxBudget` / `parsedMaxBudget`** — The user's maximum meal budget in Philippine Pesos (₱) (e.g., `≤ ₱100`, `≤ ₱150`, `≤ ₱250`, `≤ ₱400`, or any custom ₱ amount). It filters the map and list to show restaurants with verified dishes inside that budget.
- **`pinLimit`** — Limits how many pins show on the map at once (default is `60 pins`) so the map never lags.

### Location & OSRM Routing Variables (`useGeolocation.js` & `useRouting.js`)
- **`coords` / `activeLocation`** — The user's starting latitude and longitude (either from browser GPS or a point they clicked on the map).
- **`targetRestaurant`** — The destination restaurant the user wants directions to.
- **`route`** — The road route data returned by OSRM, containing:
  - **`positions`** — The list of `[latitude, longitude]` points used to draw the purple and amber road line on the map.
  - **`distanceKmText`** — The total driving distance formatted in kilometers (e.g., `2.4 km`).
  - **`durationMinText`** — The estimated driving time formatted in minutes (e.g., `8 min`).
  - **`steps`** — The turn-by-turn driving instructions (e.g., *"Turn right onto Osmeña Boulevard"*).

### Owner Portal Variables (`OwnerDashboard.jsx` & `MenuDraftEditor.jsx`)
- **`session`** — Holds the currently logged-in owner's account details from Supabase Auth.
- **`claims`** — The list of restaurants the logged-in owner has claimed and whether they are `pending`, `approved`, or `rejected`.
- **`items`** — The list of food dishes inside the owner's draft menu editor.

---

## PART 6: Privacy, Terms & Conditions (The CIA Triad)

> "For our **Privacy Policy and Terms & Conditions** (`/privacy-terms`), we structured our security and user rules around the **CIA Triad**—**Confidentiality**, **Integrity**, and **Availability**:"

### 1. C — Confidentiality (Keeping Private Data Private)
- **User GPS Location Privacy** — When a user clicks *"Get Directions"*, their GPS location is only used live in the browser to calculate the route. We **never save or store** user locations in our database.
- **Private Ownership Proof** — When a restaurant owner submits business proof (`evidence`) to claim a restaurant, **Supabase Row Level Security (RLS)** hides it from the public so only the owner and authorized reviewers can see it.
- **Private Menu Drafts** — Dishes saved in `restaurant_menu_drafts` stay private to that owner until they click *"Publish Menu"*.
- **Protected Keys & Passwords** — Passwords are encrypted by Supabase Auth, and secret `service_role` keys are never put in the frontend code.

### 2. I — Integrity (Keeping Data Accurate & Untampered)
- **No Fake Menus or Prices** — We never invent fake restaurants or prices. If a restaurant has no verified owner menu, the app honestly shows *"Menu currently unavailable."*
- **No Self-Approval** — Database security rules (`owner_id <> auth.uid()`) stop restaurant owners from approving their own claims or editing another restaurant's menu.
- **Cebu City Border & Price Checks** — The database function `is_cebu_city_location` checks that restaurant coordinates are truly inside Cebu City, and price rules make sure peso prices (`₱`) are valid numbers.
- **Auto-Remove on Revocation** — If an owner's claim is ever revoked, a database trigger automatically deletes their published menu so outdated info doesn't stay live.

### 3. A — Availability (Keeping the App Fast & Working When Needed)
- **Anti-Lag Map Pin Cap** — To stop the map from lagging when hundreds of restaurants load, we limit the visible pins on the map (default `60 pins`) and prioritize restaurants closest to the center of the screen.
- **Overpass Caching & Backup Servers** — We cache restaurant results for 10 minutes, prevent duplicate requests, and automatically switch to backup Overpass servers if the main server is busy.
- **Manual Starting Point Fallback** — If a user denies GPS permission or doesn't have GPS on their device, they can still get OSRM driving directions by clicking any starting point on the map or picking a Cebu City landmark preset.

---

## PART 7: Quick Demo Flow (Step-by-Step What to Show Live)

1. **Discover & Filter**: Show the split-screen map centered on **Cebu City**. Click the `Restaurant`, `Café`, and `Fast Food` tabs, and show the **Pin Cap (`60 pins`)** selector that prevents map lag.
2. **View Restaurant & Menu**: Click a restaurant card or map pin. Point out the address, opening hours, and the **"Menu currently unavailable"** message (or **Verified Menu in ₱** if published), explaining that the app never invents fake menu prices.
3. **OSRM Get Directions**: Click **"Get Directions"**. Allow GPS (or tap a preset like *Fuente Osmeña* / click on the map). Show the road line drawn on the map, the **distance in km**, **duration in minutes**, and **turn-by-turn steps**.
4. **Mobile View**: Resize the browser to mobile width to show the **flexible bottom sheet**, **collapsible filters**, and **Route tab**.
5. **Owner Portal & Claim Review**: Click **Owner Portal**, show how an owner logs in, claims a Cebu City restaurant, adds a dish with price in `₱` and photo upload, and publishes the menu.
