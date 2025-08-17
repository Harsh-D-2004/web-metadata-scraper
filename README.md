# 📌 Project Name

Automated scraping + API service with Puppeteer and Prisma.

---

## 🚀 Summary
This project provides:
- **Puppeteer-based scraping**
- **CRUD APIs** (GET, POST, PUT, DELETE)
- **Database integration** with Prisma
- **Rate limiting** (2 requests per minute per client)

---

## 🛠 Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-repo/project-name.git
cd project-name
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create a `.env` file
Copy the `.env.example` file and rename it to `.env`
```bash
cp .env.example .env
```

### 4. Configure the environment variables
Update the `.env` file with your own values
```bash
GEMINI_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY"
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
NODE_ENV="development"
```

Replace `YOUR_API_KEY` with your actual API key.

### 5. Generate Prisma Client
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 6. Start the server
```bash
npm run dev
```

---

### Puppeteer

Local (dev): uses puppeteer

Production (Render/Linux): uses puppeteer-core + @sparticuz/chromium

### API list

#### POST /website

Create a new website

**Parameters**

- `url`: string

**Response**

- 201 Created
- 400 Bad Request
- 500 Internal Server Error

#### GET /website

Get all websites

**Response**

- 200 OK
- 404 Not Found
- 500 Internal Server Error

#### PUT /website/:id

Update a website

**Parameters**

- `id`: integer
- `brand_name`: string
- `description`: string

**Response**

- 200 OK
- 400 Bad Request
- 500 Internal Server Error

#### DELETE /website/:id

Delete a website

**Parameters**

- `id`: integer

**Response**

- 200 OK
- 400 Bad Request    
- 500 Internal Server Error

---

### Rate limiting
The rate limit is set to 2 requests per minute per client.


### Example usage:

```bash
Request:
{
    "url" : "https://testbook.com/"
}

Response:
{
    "id": 30,
    "url": "https://testbook.com/",
    "brand_name": "Testbook",
    "description": "Testbook is an online learning platform that provides comprehensive exam preparation resources. It offers courses, live classes, test series, and study material for various competitive exams in India. The platform aims to help students learn, practice, improve, and succeed in their exam preparations.",
    "timestamp": "2025-08-17T07:47:41.709Z"
}
```

