🚆 PRASA Smart Connect

A smart commuter platform designed for Passenger Rail Agency of South Africa Metrorail passengers in the Western Cape, South Africa.

PRASA Smart Connect provides:

Real-time train tracking
Smart trip planning
Service alerts
AI-powered chatbot assistance
Lost & Found management
Safety incident reporting
Ticket generation and history
Crowd and sentiment analysis

All within a single modern web application.

📚 Table of Contents
About the Project
Features
Tech Stack
Project Structure
Prerequisites
Getting Started
Environment Variables
Running the Application
Deployment
API Overview
Admin Dashboard
📖 About the Project

PRASA Smart Connect is a full-stack train assistance platform developed to improve the daily commuting experience for Cape Town Metrorail passengers.

The system aggregates:

live train schedules
service disruptions
station information
passenger feedback
AI-generated travel assistance

The application also enables:

automated email notifications
lost item management
safety reporting
smart crowd prediction

The platform is hosted on Netlify
 with a Supabase
 PostgreSQL backend and uses EmailJS
 for transactional email notifications.

✨ Features
Feature	Route	Description
Home	/	Landing page with train network overview
Trip Search	/search	Search trains between stations and generate tickets
Trip Planner	/planner	Multi-route journey planning
Live Tracking	/tracking	Simulated real-time train tracking
Service Alerts	/alerts	Real-time train disruption updates
Interactive Map	/map	Live station and route visualization
News	/news	Latest PRASA-related news
Fares	/fares	Fare and pricing information
Crowding & Sentiment	/crowding	AI-powered crowd and safety analysis
Lost & Found	/lost-found	Report and track lost items
Safety Reports	/safety	Submit safety incidents
My Tickets	/tickets	View generated ticket history
Register	/register	Subscribe to station alerts
Admin Dashboard	/admin	Protected admin management panel
AI Chatbot	/chatbot	Intelligent train assistant
🛠 Tech Stack
Frontend
Technology	Purpose
React 19	Frontend framework
TypeScript	Type safety
Tailwind CSS	Styling
TanStack Router	Routing
TanStack Query	Data fetching
Radix UI	Accessible UI components
Leaflet + React Leaflet	Interactive maps
Recharts	Data visualisation
Lucide React	Icons
Zod	Validation
Backend
Technology	Purpose
Express.js	REST API
Node.js	Backend runtime
TypeScript	Server-side type safety
node-cron	Scheduled scraping
Axios + Cheerio	Train data scraping
serverless-http	Netlify serverless support
Database & Integrations
Service	Purpose
Supabase
	PostgreSQL database
EmailJS
	Email notifications
Hugging Face
	Sentiment analysis
OpenAI API
	AI chatbot
SerpAPI
	News scraping
📂 Project Structure
prasa-smart-connect/
├── netlify/
├── server/
├── src/
├── .env
├── package.json
├── vite.config.ts
└── supabase_migration.sql
Main Backend Modules
chatbot.ts → AI chatbot
scraper.ts → CTTrains scraper
lostFound.ts → Lost & Found APIs
sentiment.ts → AI sentiment analysis
tickets.ts → Ticket generation
stationSearch.ts → Station search and maps
⚙️ Prerequisites

Before running the project, ensure you have:

Node.js v20+
npm v9+
A Supabase
 project
An EmailJS
 account
🚀 Getting Started
1. Clone the Repository
git clone https://github.com/your-username/prasa-smart-connect.git
cd prasa-smart-connect
2. Install Dependencies
npm install
3. Configure Environment Variables
cp .env.example .env

Add your API keys and configuration values.

4. Configure the Database

Run the supabase_migration.sql script inside your Supabase SQL Editor.

This creates tables for:

users
subscriptions
train updates
tickets
lost items
safety reports
sentiment analysis
scraped train data
5. Test External Services
npm run test:connections
🔐 Environment Variables
PORT=3001
VITE_API_URL=http://localhost:3001

SUPABASE_URL=
SUPABASE_SERVICE_KEY=

EMAILJS_SERVICE_ID=
EMAILJS_TEMPLATE_ID=
EMAILJS_PUBLIC_KEY=
EMAILJS_PRIVATE_KEY=

OPENAI_API_KEY=
VITE_HF_API_TOKEN=
SERPAPI_KEY=

For deployment, add these variables in the Netlify dashboard.

▶️ Running the Application
Backend
npm run server

Runs at:

http://localhost:3001
Frontend
npm run dev

Runs at:

http://localhost:8080
📦 Deployment

The project is configured for deployment on Netlify
.

Deployment Steps
Push the project to GitHub
Connect repository to Netlify
Configure environment variables
Deploy

The backend runs using Netlify Functions.

🔌 API Overview
Method	Endpoint	Description
GET	/api/schedules	Retrieve train schedules
GET	/api/alerts	Retrieve service alerts
POST	/api/register	Register a user
POST	/api/subscribe	Subscribe to alerts
POST	/api/chatbot	AI chatbot endpoint
POST	/api/lost-found	Report lost items
POST	/api/safety	Submit safety reports
POST	/api/tickets	Generate tickets
POST	/api/sentiment	Analyse sentiment
POST	/api/admin/update	Push train updates
🛡 Admin Dashboard

Access:

/admin/login

The dashboard allows administrators to:

manage schedules
post alerts
review safety reports
manage lost items
notify passengers
publish news
monitor sentiment analysis
manage subscribers
🤖 AI Features

The platform includes:

AI chatbot assistance
Crowd prediction
Safety analysis
Smart route recommendations
Sentiment analysis using:
Hugging Face
VADER
🌍 Vision

PRASA Smart Connect aims to modernize commuter rail experiences in South Africa by combining:

real-time transport data
AI-driven assistance
automation
modern web technologies

into one intelligent commuter platform.

Built for Cape Town Metrorail commuters.
