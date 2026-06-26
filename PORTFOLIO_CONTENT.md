# Portfolio Content

> A single source of truth for all written content in this portfolio website.
> Edit the values here, then update the matching files (noted under each section) to push changes to the live site.

---

## 1. Profile / Personal Info

> Source: [src/constants.ts](src/constants.ts) → `PROFILE`

| Field | Value |
|---|---|
| **Name** | Low Chee Fei |
| **Title** | Junior Software Developer |
| **Headline** | Bridging Mobile Innovation with Enterprise Solutions |
| **Email** | horuslow0218@gmail.com |
| **Location** | Petaling Jaya, Selangor _(from [src/components/Contact.tsx](src/components/Contact.tsx))_ |
| **GitHub** | https://github.com/KrisLowz |
| **LinkedIn** | https://www.linkedin.com/in/lowcheefei/ |
| **CV / Resume** | https://drive.google.com/file/d/10t-OUA1b0qfzzDt6ggl6EEy-NgRhFRrP/view?usp=sharing _(from [src/components/Hero.tsx](src/components/Hero.tsx))_ |
| **Avatar image** | /assets/ME.png |

**Bio**

> I am a Computer Science graduate from Swinburne University (Class of 2026) specializing in Software Development, now working as a Junior Software Developer. With a strong foundation in both mobile application development and enterprise ERP implementation, I bridge the gap between user-centric design and robust backend systems. My passion lies in solving real-world inefficiencies through technology, demonstrated by my award-winning final year project.

---

## 2. Hero Section

> Source: [src/components/Hero.tsx](src/components/Hero.tsx)

| Element | Value |
|---|---|
| **Status badge** | Available for 2026 Opportunities |
| **Greeting** | Hi, I am … |
| **Typewriter roles** | Low Chee Fei · Web Developer · Mobile Developer · UI/UX Designer |
| **Tagline** | I bridge the gap between playful mobile interactions and robust enterprise systems. |
| **Primary button** | View Work → (#projects) |
| **Secondary button** | Download CV (Google Drive link above) |

---

## 3. About Section

> Source: [src/components/About.tsx](src/components/About.tsx)

| Element | Value |
|---|---|
| **Section tag** | About Me |
| **Heading** | Engineering with **Purpose & Precision** |

**Paragraph 1**

> I'm a software developer who believes that great code should be invisible to the user. Whether it's a mobile app or website/webpage, the experience should be fluid, intuitive, and reliable.

**Paragraph 2**

> Having graduated from **Swinburne University of Technology** in 2026, I'm now a Junior Software Developer — already helping businesses solve real-world logistic challenges through my award-winning work.

**Interactive avatar text:** "Let's Code! 🚀" / "Click me!" / "I love building cool stuff."

### Technical Skills (Solar System icons)

**Inner ring (Languages / Core):**
HTML5, CSS3, JavaScript, Python, Java, C++, C#, SQL

**Outer ring (Tools / Frameworks):**
Figma, Tailwind CSS, PostgreSQL, Firebase, Kotlin, Flutter, Android, Git, VS Code

---

## 4. Professional Skills (Soft Skills)

> Source: [src/components/ProfessionalSkills.tsx](src/components/ProfessionalSkills.tsx) — section tag "Beyond the Code"

| Skill | Description |
|---|---|
| **Problem Solving** | Analyzing complex issues to find efficient, scalable solutions. |
| **Critical Thinking** | Evaluating data objectively to make informed technical decisions. |
| **Communication** | Translating technical concepts for non-technical stakeholders. |
| **Project Mgmt** | Agile methodologies, sprint planning, and backlog management. |
| **Time Mgmt** | Prioritizing tasks effectively to meet strict deployment deadlines. |
| **Teamwork** | Collaborating across cross-functional teams to drive product success. |
| **Adaptability** | Quickly learning new stacks (like Flutter/React) as project needs evolve. |

---

## 5. Experience

> Source: [src/constants.ts](src/constants.ts) → `EXPERIENCE` — section tag "Career Journey"

### Intern – Web Developer
- **Company:** MR BUR (M) SDN BHD
- **Period:** Jan – March 2026
- **Description:** Designed and developed brand-new web applications to streamline dental clinics' daily operations, deployed on Cloudflare's edge network for speed and reliability.
- **Skills:** Web Design, Web Development, Cloudflare Workers

### Intern – ERP Consultant
- **Company:** ONE ERP SOLUTIONS SDN BHD
- **Period:** Jan – March 2023
- **Description:** Contributed to the implementation lifecycle of Oracle JD Edwards (JDE) ERP systems.
- **Skills:** Oracle JDE, Database Management, Client Communication

### Logistic Admin _(currently commented out / hidden)_
- **Company:** DS HOME
- **Period:** 2019 – 2020
- **Description:** Managed inventory logistics and optimized delivery schedules to ensure timely fulfillment.
- **Skills:** Logistics Management, Data Entry, Scheduling

---

## 6. Projects

> Source: [src/constants.ts](src/constants.ts) → `PROJECTS`

### 6.1 TrackPoint — Sales Performance Tracker
- **ID:** `trackpoint`
- **Short description:** A mobile solution developed for HuaChang Growmax to modernize their order management and logistics tracking.
- **Tags:** Kotlin, Firebase, Android, Google Maps API
- **Cover image:** /assets/TrackPoint.png

**Overview**
> TrackPoint is a comprehensive mobile solution designed for HuaChang Growmax to modernize their traditional sales and logistics operations. By replacing manual paper records with a digital system, the app streamlines order management and provides real-time visibility into the supply chain.

**Achievements**
- 🏆 Awarded 'Best Project on Display' at ICT Tradeshow 2025.
- Solved critical client inefficiency by digitizing paper-based order tracking.
- Implemented real-time GPS tracking for sales personnel and delivery logistics.

**Challenges**
- Reliance on paper-based order tracking caused data entry errors and significant delays in processing.
- Lack of real-time visibility for delivery trucks led to inefficient routing and scheduling.
- Sales personnel operated in remote areas with poor internet connectivity, requiring robust offline capabilities.

**Solutions**
- Digitized the entire order lifecycle using a native Android interface synchronized with a Firebase Realtime Database.
- Integrated Google Maps API to track delivery vehicles in real-time, allowing for dynamic route optimization.
- Implemented a local Room database with background sync work managers to ensure full functionality without internet access.

**Tech Stack**
- **Mobile:** Kotlin, Jetpack Compose, Android SDK
- **Backend:** Firebase Realtime DB, Cloud Functions, Authentication
- **Services:** Google Maps SDK, Google Places API
- **Architecture:** MVVM Pattern, Repository Pattern, Coroutines

**Screenshots:** Login, Dashboard, Orders, OrderDetails, Map, GPSTracking, Delivery, Analytics, Reports, Settings, Profile, Notifications, SyncStatus (`/assets/TrackPoint_01…13`)

---

### 6.2 Cinemate — Movie Recommendation System
- **ID:** `cinemate`
- **Short description:** A sophisticated web application that provides personalized movie suggestions using sentiment analysis and external data sources.
- **Tags:** Python, Django, JavaScript, TMDB API, NLP
- **Cover image:** /assets/Cinemate.png

**Overview**
> Cinemate is an intelligent movie discovery platform that leverages natural language processing to understand user preferences. Unlike traditional collaborative filtering, Cinemate analyzes the sentiment behind user reviews to recommend movies that match a specific emotional tone.

**Achievements**
- ⭐ Achieved Grade A for technical complexity and user experience.
- Integrated TMDB API for real-time movie metadata.
- Built a custom sentiment analysis engine to categorize user reviews and refine recommendations.

**Challenges**
- Users often struggle to find movies based on 'vibe' rather than just standard genres.
- The 'Cold Start' problem made it difficult to recommend movies to new users with no viewing history.
- Processing thousands of movie reviews for sentiment analysis was computationally expensive.

**Solutions**
- Developed a sentiment analysis engine using NLTK to tag movies with emotional descriptors based on user reviews.
- Created an interactive onboarding quiz to build an initial user profile instantly, solving the cold start issue.
- Utilized TMDB API for rich metadata and cached analyzed sentiment scores in a local SQLite database for high performance.

**Tech Stack**
- **Frontend:** HTML5, Tailwind CSS, JavaScript
- **Backend:** Python, Django MTV, SQLite
- **AI / ML:** NLTK, TextBlob, Scikit-learn
- **Data Sources:** TMDB API, RESTful Services

**Screenshots:** Homepage, Search, Recommendations, MovieDetail, Reviews, SentimentAnalysis, WishList, UserProfile, Settings, About, Dashboard, Analytics, TrendingMovies, GenreFilter, SocialSharing, Notifications, HelpSupport (`/assets/Cinemate_01…17`)

---

### 6.3 Splash Aquatics — Online Aquarium Store
- **ID:** `splashaquatics`
- **Short description:** A full-stack e-commerce platform for aquarium enthusiasts to purchase supplies and manage their aquatic setups.
- **Tags:** Python, Flask, JavaScript, CSS, MySQL
- **Cover image:** /assets/SplashAquatics.png

**Overview**
> Splashaquatics is a comprehensive online store designed for aquarium enthusiasts, offering a wide range of products and tools to manage aquatic setups effectively. The platform combines e-commerce functionality with specialized features like a fish tank builder to enhance user experience.

**Achievements**
- ⭐ Achieved Distinction grade from the Managing Software Project subject.
- Innovated a user-friendly interface tailored for aquarium hobbyists.
- Fish tank builder feature enhanced user engagement, fish compatibility checks improved customer satisfaction.

**Challenges**
- Customers found it difficult to select compatible fish and equipment for their aquariums.
- Lack of an intuitive interface led to lower user engagement and higher bounce rates.
- Managing inventory and ensuring timely delivery was complex and prone to errors.

**Solutions**
- Developed a fish tank builder tool that allows users to design their aquariums and receive compatibility recommendations for fish and equipment.
- Implemented a clean, responsive UI using Flask and JavaScript to enhance user experience and engagement.
- Optimized inventory management and streamlined delivery processes to reduce errors and improve efficiency.

**Tech Stack**
- **Frontend:** HTML5, CSS, JavaScript
- **Backend:** Python, Flask, MySQL
- **AI / ML:** Custom Algorithms, Chatbot
- **Data Sources:** RESTful Services

**Screenshots:** Homepage, Classes, Schedule, Instructors, About, ClassDetail, Booking, MemberProfile, Pricing, Reviews, Gallery, Contact, FAQ, Payment, Confirmation (`/assets/SplashAquatics_01…15`)
> Note: this is my own original aquarium store project (not copied). The current screenshot filenames (Classes/Schedule/Instructors) are leftover placeholders — rename them to match the real aquarium store pages (e.g. Shop, Product, Cart, TankBuilder, Checkout).

---

## 7. Contact Section

> Source: [src/components/Contact.tsx](src/components/Contact.tsx)

| Element | Value |
|---|---|
| **Section tag** | Let's Chat |
| **Heading** | Have an idea? Let's build it together. |
| **Subtext** | I'm currently available for freelance projects and full-time roles. |
| **Email** | horuslow0218@gmail.com (`PROFILE.email`) |
| **Location** | Petaling Jaya, Selangor. |
| **Footer** | © 2026 Low Chee Fei. Designed with ♥ and React. |

Contact form fields: Name, Email, Message _(currently not wired to a backend — `onSubmit` is prevented)._

---

## 8. AI Chatbot Knowledge Base

> Source: [src/constants.ts](src/constants.ts) → `SYSTEM_INSTRUCTION` (used by [src/services/geminiService.ts](src/services/geminiService.ts))

This is the context the AI resume assistant uses to answer visitor questions:

- **Name:** Low Chee Fei
- **Degree:** Bachelor of Computer Science (Software Development) — Swinburne University (Graduated 2026).
- **Current Role:** Junior Software Developer (completed all studies).
- **Key Awards:** "Best Project on Display" (ICT Tradeshow 2025) for Final Year Project "TrackPoint".
- **Skills**
  - Languages: Kotlin, Python, JavaScript, HTML, CSS, SQL.
  - Frameworks: Django, Firebase, React, MySQL Workbench.
  - Enterprise: Oracle JD Edwards (JDE) Implementation.
- **Experience**
  1. MR BUR (M) SDN BHD (Intern – Web Developer): Built brand-new web applications for dental clinics' daily operations, deployed on Cloudflare Workers.
  2. ONE ERP SOLUTIONS (Intern): Worked on Oracle JDE implementation, DB management, integration.
- **Projects**
  1. TrackPoint (Mobile App – Kotlin/Firebase): Sales performance / GPS tracking for HuaChang Growmax. Award winner.
  2. Cinemate (Web App – Python/Django): Movie recommendation system using TMDB API and AI sentiment analysis. Grade A.
  3. Splash Aquatics (Web App – Python/Flask/MySQL): Full-stack e-commerce aquarium store with a fish tank builder and fish compatibility checks. Distinction grade.
- **Personality:** Professional, innovative, problem-solver, eager to bridge mobile and enterprise tech.

---

## 9. Site Metadata

> Source: [metadata.json](metadata.json)

| Field | Value |
|---|---|
| **Name** | Low Chee Fei - Portfolio |
| **Description** | Professional e-portfolio for Low Chee Fei, featuring a showcase of software development projects, experience, and an AI-powered resume assistant. |

---

## ✅ Status (2026 update)

All values are now aligned across the codebase:
- ✅ Graduation status reads "Graduated 2026 / Junior Software Developer" across all files.
- ✅ Title updated to "Junior Software Developer".
- ✅ Year references (Hero badge, footer) bumped to 2026.
- ✅ Email confirmed as `horuslow0218@gmail.com` (placeholder note removed).
- ✅ Splash Aquatics confirmed as an original aquarium store project (screenshot filenames left as-is by choice).
