import { Project, ExperienceItem, SkillCategory } from './types';

export const PROFILE = {
  name: "Low Chee Fei",
  title: "Software Developer",
  headline: "Bridging Mobile Innovation with Enterprise Solutions",
  bio: `I am a Computer Science graduate from Swinburne University (Class of 2025) specializing in Software Development. With a strong foundation in both mobile application development and enterprise ERP implementation, I bridge the gap between user-centric design and robust backend systems. My passion lies in solving real-world inefficiencies through technology, demonstrated by my award-winning final year project.`,
  email: "horuslow0218@gmail.com", // Placeholder
  social: {
    github: "https://github.com/KrisLowz",
    linkedin: "www.linkedin.com/in/lowcheefei"
  }
};

export const SKILLS: SkillCategory[] = [
  {
    title: "Languages",
    skills: ["Kotlin", "Python", "JavaScript", "TypeScript", "HTML5", "CSS3", "SQL"]
  },
  {
    title: "Frameworks & Tools",
    skills: ["Django", "React", "Firebase", "MySQL Workbench", "Git", "Tailwind CSS"]
  },
  {
    title: "Enterprise Systems",
    skills: ["Oracle JD Edwards (JDE)", "ERP Implementation", "System Integration"]
  }
];

export const PROJECTS: Project[] = [
  {
    id: "trackpoint",
    title: "TrackPoint",
    subtitle: "Sales Performance & GPS Tracker",
    description: "A mobile solution developed for HuaChang Growmax to modernize their order management and logistics tracking.",
    tags: ["Kotlin", "Firebase", "Android", "Google Maps API"],
    image: "https://picsum.photos/800/450?grayscale",
    achievements: [
      "🏆 Awarded 'Best Project on Display' at ICT Tradeshow 2025.",
      "Solved critical client inefficiency by digitizing paper-based order tracking.",
      "Implemented real-time GPS tracking for sales personnel and delivery logistics."
    ],
    overview: "TrackPoint is a comprehensive mobile solution designed for HuaChang Growmax to modernize their traditional sales and logistics operations. By replacing manual paper records with a digital system, the app streamlines order management and provides real-time visibility into the supply chain.",
    challenges: [
      "Reliance on paper-based order tracking caused data entry errors and significant delays in processing.",
      "Lack of real-time visibility for delivery trucks led to inefficient routing and scheduling.",
      "Sales personnel operated in remote areas with poor internet connectivity, requiring robust offline capabilities."
    ],
    solutions: [
      "Digitized the entire order lifecycle using a native Android interface synchronized with a Firebase Realtime Database.",
      "Integrated Google Maps API to track delivery vehicles in real-time, allowing for dynamic route optimization.",
      "Implemented a local Room database with background sync work managers to ensure full functionality without internet access."
    ],
    techStackDetails: [
      { category: "Mobile", tools: ["Kotlin", "Jetpack Compose", "Android SDK"] },
      { category: "Backend", tools: ["Firebase Realtime DB", "Cloud Functions", "Authentication"] },
      { category: "Services", tools: ["Google Maps SDK", "Google Places API"] },
      { category: "Architecture", tools: ["MVVM Pattern", "Repository Pattern", "Coroutines"] }
    ]
  },
  {
    id: "cinemate",
    title: "Cinemate",
    subtitle: "AI-Powered Movie Recommendation",
    description: "A sophisticated web application that provides personalized movie suggestions using sentiment analysis and external data sources.",
    tags: ["Python", "Django", "JavaScript", "TMDB API", "NLP"],
    image: "https://picsum.photos/800/451?grayscale",
    achievements: [
      "⭐ Achieved Grade A for technical complexity and user experience.",
      "Integrated TMDB API for real-time movie metadata.",
      "Built a custom sentiment analysis engine to categorize user reviews and refine recommendations."
    ],
    overview: "Cinemate is an intelligent movie discovery platform that leverages natural language processing to understand user preferences. Unlike traditional collaborative filtering, Cinemate analyzes the sentiment behind user reviews to recommend movies that match a specific emotional tone.",
    challenges: [
      "Users often struggle to find movies based on 'vibe' rather than just standard genres.",
      "The 'Cold Start' problem made it difficult to recommend movies to new users with no viewing history.",
      "Processing thousands of movie reviews for sentiment analysis was computationally expensive."
    ],
    solutions: [
      "Developed a sentiment analysis engine using NLTK to tag movies with emotional descriptors based on user reviews.",
      "Created an interactive onboarding quiz to build an initial user profile instantly, solving the cold start issue.",
      "Utilized TMDB API for rich metadata and cached analyzed sentiment scores in a local SQLite database for high performance."
    ],
    techStackDetails: [
      { category: "Frontend", tools: ["HTML5", "Tailwind CSS", "JavaScript"] },
      { category: "Backend", tools: ["Python", "Django MTV", "SQLite"] },
      { category: "AI / ML", tools: ["NLTK", "TextBlob", "Scikit-learn"] },
      { category: "Data Sources", tools: ["TMDB API", "RESTful Services"] }
    ]
  }
];

export const EXPERIENCE: ExperienceItem[] = [
  {
    id: "one-erp",
    role: "Intern - ERP Consultant",
    company: "ONE ERP SOLUTIONS SDN BHD",
    period: "Jan - March 2023",
    description: "Contributed to the implementation lifecycle of Oracle JD Edwards (JDE) ERP systems.",
    skills: ["Oracle JDE", "Database Management", "Client Communication"]
  },
  {
    id: "ds-home",
    role: "Logistic Admin",
    company: "DS HOME",
    period: "2019 - 2020",
    description: "Managed inventory logistics and optimized delivery schedules to ensure timely fulfillment.",
    skills: ["Logistics Management", "Data Entry", "Scheduling"]
  }
];

export const SYSTEM_INSTRUCTION = `
You are an AI assistant for Low Chee Fei's portfolio website.
Your goal is to answer questions about Chee Fei's professional background, skills, and projects based strictly on the following context.

Name: Low Chee Fei
Degree: Bachelor of Computer Science (Software Development) - Swinburne University (Graduating 2025).
Key Awards: "Best Project on Display" (ICT Tradeshow 2025) for Final Year Project "TrackPoint".

Skills:
- Languages: Kotlin, Python, JavaScript, HTML, CSS, SQL.
- Frameworks: Django, Firebase, React, MySQL Workbench.
- Enterprise: Oracle JD Edwards (JDE) Implementation.

Experience:
1. ONE ERP SOLUTIONS (Intern): Worked on Oracle JDE implementation, DB management, integration.
2. DS HOME (Logistic Admin): Managed inventory/delivery.

Projects:
1. TrackPoint (Mobile App - Kotlin/Firebase): Sales performance/GPS tracking for HuaChang Growmax. Award winner. Solved real-world logistics problems.
2. Cinemate (Web App - Python/Django): Movie recommendation system using TMDB API and AI sentiment analysis. Grade A.

Personality: Professional, innovative, problem-solver, eager to bridge mobile and enterprise tech.

If a user asks about something not in this list, politely say you don't have that information but suggest they contact Chee Fei directly.
Keep answers concise, professional, and encouraging.
`;
