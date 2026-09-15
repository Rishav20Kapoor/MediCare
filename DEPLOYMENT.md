# Deployment

This project consists of three deployable services:

| Service | Recommended host | Root directory | Build / start command |
| --- | --- | --- | --- |
| API | Render web service | `backend` | `npm install` / `npm start` |
| Patient portal | Vercel | `frontend` | `npm run build` |
| Admin portal | Vercel | `admin` | `npm run build` |

## 1. Prepare a MongoDB database

Create a MongoDB Atlas database and create a database user. Copy its connection string as `MONGODB_URI`.

## 2. Deploy the API on Render

1. Push this repository to GitHub and select **New + > Web Service** in Render.
2. Choose the repository, set **Root Directory** to `backend`, then use build command `npm install` and start command `npm start`.
3. Set the health-check path to `/health`.
4. Add the variables from `backend/.env.example`, using your real service credentials. Leave `CLIENT_ORIGINS` and `FRONTEND_URL` until the Vercel URLs are known.
5. Deploy and copy the resulting API URL, for example `https://medicare-api.onrender.com`.

## 3. Deploy both Vite portals on Vercel

Create two Vercel projects from the same repository.

For the patient portal, select `frontend` as the root directory and add:

```
VITE_API_URL=https://your-api.onrender.com
VITE_CLERK_PUBLISHABLE_KEY=pk_...
```

For the admin portal, select `admin` as the root directory and add the same two variables. Vercel uses `npm run build` and publishes `dist` automatically. The included `vercel.json` files make direct links to React Router pages work.

## 4. Complete API configuration

After both Vercel deployments finish, update the Render API environment variables and redeploy:

```
CLIENT_ORIGINS=https://your-patient-portal.vercel.app,https://your-admin-portal.vercel.app
FRONTEND_URL=https://your-patient-portal.vercel.app
```

Also add both portal URLs to Clerk's allowed origins and redirect URLs. If Razorpay is enabled, configure its production keys and the patient portal URL in the Razorpay dashboard.

## Production checklist

- Do not commit any `.env` files or secrets.
- Use production MongoDB, Clerk, Cloudinary, and Razorpay credentials.
- Open `https://your-api/health`; it should return `{ "status": "ok" }`.
- Test sign-in, doctor creation, appointment booking, payment confirmation, and direct navigation to a portal route.
