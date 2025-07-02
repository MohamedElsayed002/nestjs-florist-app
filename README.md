# 🌸 Flower Obsession Backend API (NestJS)

A secure and scalable florist management backend built with **NestJS**. This API handles user authentication, authorization, and product management, and is designed to integrate seamlessly with a connected frontend.


## 🌐 Frontend 

🔗 Live Site: [Flower Obsession Webiste](https://florist-nextjs-neon.vercel.app/en)
💻 Frontend Code: [Code](https://github.com/MohamedElsayed002/flower-obession-nextjs)


## 📑 API Documentation

📄 Postman Docs: [View API Documentation](https://documenter.getpostman.com/view/25341458/2sAYkARP3u#3d4bae23-ca86-43ba-857f-0c19c622c49e)
---

## 🚀 Features

- 🌿 User Registration & Login
- 🔒 Password encryption with **bcrypt**
- 🛡️ Authentication and Authorization (role-based access control)
- 📦 Product Management APIs (CRUD)
- 📡 Connected to a frontend interface
- 📝 Secure environment configuration via `.env` file

---

## 📦 Tech Stack

- **NestJS** (Node.js Framework)
- **TypeScript**
- **bcrypt** (Password hashing)
- **JWT** (Authentication tokens)
- **MongoDB** (Database)
- **Mongoose** (ODM) and Many More 

---

## 📂 Installation & Setup

Follow these steps to get the project running locally:

### 1.  Clone the repository:

```bash
git clone https://github.com/MohamedElsayed002/nestjs-florist-app.git
cd nestjs-florist-app
```

### 2. Create .env file 

```.env
PORT = ##
MONGO_URL = ##
SALT = ##
JWT_SECRET = ##
NODEMAILER_EMAIL = ##
NODEMAILER_PASSWORD = ##
CLOUDINARY_CLOUD_NAME = ##
CLOUDINARY_API_KEY = ##
CLOUDINARY_API_SECRET = ##
STRIPE_SECRET_KEY = ##
CLIENT_URL = "https://florist-nextjs-neon.vercel.app/"
```

### 3.  Install dependencies:

```bash
  npm install 
```

### 4. Run the development server:

```bash
npm run start:dev
```

