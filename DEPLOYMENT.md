# BirgaQil — Deployment Guide 🚀

## Local Development

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 2. Database Setup
```bash
# Create database
createdb birgaqil_db

# Run schema
psql -d birgaqil_db -f database/schema.sql
```

### 3. Environment Variables
`.env` faylini tahrirlang va DB credentials kiriting.

### 4. Install & Run
```bash
npm install
npm run dev    # Development (nodemon)
npm start      # Production
```
Server: `http://localhost:5000`

---

## Production Deployment

### Backend — Render / Railway

1. GitHub repo yarating va push qiling
2. [Render](https://render.com) yoki [Railway](https://railway.app) da yangi Web Service yarating
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. Environment variables qo'shing:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   - `JWT_SECRET` (haqiqiy kuchli token kiriting)
   - `JWT_REFRESH_SECRET` (boshqa kuchli token)
   - `CLIENT_URL` (deploy URL)

### Database — Railway PostgreSQL

1. Railway da yangi PostgreSQL service qo'shing
2. Connection credentials ni oling
3. `schema.sql` ni Railway PostgreSQL ga import qiling

### Frontend — Vercel (Optional)

Agar frontendni alohida deploy qilmoqchi bo'lsangiz:
1. `client/` papkani Vercel ga deploy qiling
2. API proxy sozlang (`vercel.json`):
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://your-backend.onrender.com/api/:path*" }
  ]
}
```

> **Eslatma**: Hozirgi arxitekturada frontend Express orqali static file sifatida serv qilinadi, shuning uchun alohida frontend deploy shart emas.

---

## Security Checklist

- [ ] `.env` faylni `.gitignore` ga qo'shing
- [ ] JWT_SECRET va JWT_REFRESH_SECRET ni kuchli random stringlarga almashtiring
- [ ] CORS origin ni production URL ga cheklang
- [ ] Rate limiting ni sozlang
- [ ] HTTPS foydalaning
- [ ] DB credentials ni environment variables orqali boshqaring

## .gitignore
```
node_modules/
.env
*.log
```
