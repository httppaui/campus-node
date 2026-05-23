\# CampusNode: Student Organization Management MVP



CampusNode is a centralized, full-stack platform designed to solve operational inefficiencies within university student organizations. It replaces fragmented tools with a single unified workspace for member management, event operations, dynamic attendance tracking, task management, and institutional memory.



\## 🚀 Core Features



\* \*\*Role-Based Access Control (RBAC):\*\* Secure access tiers for Admins (Exec Board), Officers (Committee Heads), Members, and Applicants.

\* \*\*Dynamic QR Attendance:\*\* Anti-exploit, time-rotating QR check-ins for events.

\* \*\*Kanban Task Management:\*\* Committee-specific task boards with deadlines and assignees.

\* \*\*Event \& RSVP Engine:\*\* Seamless event creation, registration, and attendance analytics.

\* \*\*Document Indexer:\*\* Centralized hub for linking SOPs, minutes, and turnover documents.

\* \*\*Gamified Engagement:\*\* Activity point tracking and leaderboards.



\## 💻 Tech Stack



\*\*Frontend\*\*

\* Framework: Next.js (App Router)

\* Styling: Tailwind CSS

\* UI Components: Shadcn UI

\* State Management: Zustand \& React Query



\*\*Backend \& Database\*\*

\* Backend: Node.js with NestJS (or Next.js API Routes)

\* Database: PostgreSQL

\* ORM: Prisma

\* Authentication: NextAuth.js (Auth.js) via Google Workspace OAuth



\## 📋 Prerequisites



Before you begin, ensure you have the following installed:

\* \[Node.js](https://nodejs.org/) (v18.0 or higher)

\* \[npm](https://www.npmjs.com/) or \[yarn](https://yarnpkg.com/)

\* \[PostgreSQL](https://www.postgresql.org/) (Local instance or cloud provider like Supabase/Neon)

\* A Google Cloud Console account (for NextAuth OAuth credentials)



\## 🛠️ Installation



1\. \*\*Clone the repository:\*\*

&#x20;  ```bash

&#x20;  git clone \[https://github.com/yourusername/campusnode-mvp.git](https://github.com/yourusername/campusnode-mvp.git)

&#x20;  cd campusnode-mvp



2\. \*\*Install dependencies:\*\*



```bash

npm install

\# or

yarn install

\## ⚙️ Environment Configuration
Create a .env file in the root directory of your project. Copy the variables below and replace the placeholder values with your actual configuration.

Code snippet
# --- DATABASE ---
# Your PostgreSQL connection string (e.g., from Supabase, Neon, or local)
DATABASE_URL="postgresql://user:password@localhost:5432/campusnode?schema=public"

# --- AUTHENTICATION (NextAuth) ---
# Generate a secret using: `openssl rand -base64 32`
NEXTAUTH_SECRET="your_generated_secret_here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth Credentials (for .edu / university email logins)
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# --- STORAGE (Optional for MVP - AWS S3 / Cloudinary) ---
UPLOAD_PROVIDER_KEY="your_upload_provider_key"
UPLOAD_PROVIDER_SECRET="your_upload_provider_secret"

\## 🗄️ Database Setup
Push the Prisma schema to your database:

```bash
npx prisma db push
(Optional) Seed the database with initial roles and dummy data:

```bash
npx prisma db seed
Generate the Prisma Client:

```bash
npx prisma generate

\## 🚀 Running the Application
Development Mode
To start the local development server with hot-reloading:


```bash

npm run dev
# or
yarn dev

Open http://localhost:3000 in your browser to view the application.

Production Build
To test the production build locally:

```bash
npm run build
npm run start


\## 🧪 Testing
To run the automated test suite (Jest / Cypress):

```bash
# Run unit tests
npm run test

# Run End-to-End (E2E) tests
npm run test:e2e

\## 🚢 Deployment Strategy
This MVP is optimized for rapid deployment using modern serverless edge networks.

Frontend/Full-stack Hosting: Vercel (Recommended for Next.js) or Railway.

Database: Supabase or Neon for scalable, serverless PostgreSQL.

Ensure you add all your .env variables to your hosting provider's environment settings before deploying.
