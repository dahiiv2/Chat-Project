# Discord-Like Chat Application

A real-time chat application with server management, channels, and direct messaging functionality built with Next.js 15.0.4, Tailwind CSS, and Prisma.

## Academic Project

This application is the final project for DAW (Web Application Development, 2nd year).

**Student:** Daniel Mellera  
**Program:** Development of Web Applications (DAW)  
**Year:** 2nd

**Deployed at:** https://dahii.es/

## Project Objectives

Develop a Discord-inspired communication platform with text, audio, and video channels, aimed at companies requiring a hierarchical communication system to facilitate real-time interaction between teams and departments, optimizing coordination.

## Project Features

- **Real-time interaction:** Users can communicate through text messages, voice calls, and video conferences.
- **Structured organization:** The system includes channels organized by topics or departments, allowing the creation of private and public spaces.
- **Role and permission management:** Implements a robust system of roles and permissions to control access to different areas of the platform.
- **Content management:** Users can share and organize images and other multimedia files.
- **Security controls:** Security measures such as user authentication, data encryption, etc. are implemented.
- **Scalability:** The platform is designed to support a large volume of concurrent users and activities.

## Project Scope

- **Frontend:** Next.js, React, Tailwind CSS, TypeScript.
- **Backend:** Node.js (integrated in Next.js) for business logic and request management.
- **Database:** MySQL, managed through Prisma to facilitate object-relational mapping, hosted by Railway.
- **Other tools:** UploadThing, Clerk.

## Implemented Features

- **Authentication** using Clerk
- **Server Management**:
  - Create and customize servers
  - Edit server details (name, image)
  - Manage server members (change roles, kick members)
  - Generate invite codes
- **Real-time Messaging**:
  - Channel-based communication
  - Direct messages between users
  - Message attachments
- **Modern UI**:
  - Responsive design
  - Dark/light mode
  - Beautiful animations and transitions

## Tech Stack

- **Framework**: Next.js 15.0.4
- **Database**: MySQL with Prisma ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand
- **File Uploads**: UploadThing
- **Form Handling**: react-hook-form with Zod validation

## Environment Variables

Required environment variables:

```
# Database
DATABASE_URL=your_database_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# UploadThing
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
UPLOADTHING_TOKEN=your_uploadthing_token
```

## TypeScript Notes

This project is built with Next.js 15.0.4 which has different typing requirements than earlier versions. Some API routes use the `any` type for parameters to ensure compatibility.

## Deployment

The application is deployed to Vercel with continuous integration from GitHub.
