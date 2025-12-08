import { Project, ExperienceItem, SkillCategory } from './types';

export const PROFILE = {
  name: "Low Chee Fei",
  title: "Software Developer",
  headline: "Bridging Mobile Innovation with Enterprise Solutions",
  bio: `I am a Computer Science graduate from Swinburne University (Class of 2025) specializing in Software Development. With a strong foundation in both mobile application development and enterprise ERP implementation, I bridge the gap between user-centric design and robust backend systems. My passion lies in solving real-world inefficiencies through technology, demonstrated by my award-winning final year project.`,
  email: "horuslow0218@gmail.com", // Placeholder
  social: {
    github: "https://github.com/KrisLowz",
    linkedin: "https://www.linkedin.com/in/lowcheefei/"
  }
};

export const PROJECTS: Project[] = [
  {
    id: "trackpoint",
    title: "TrackPoint",
    subtitle: "Sales Performance Tracker",
    description: "A mobile solution developed for HuaChang Growmax to modernize their order management and logistics tracking.",
    tags: ["Kotlin", "Firebase", "Android", "Google Maps API"],
    // Serve images from the `public/assets` folder in production
    image: "/assets/TrackPoint.png",
    screenshots: [
      "/assets/TrackPoint_01_Login.png",
      "/assets/TrackPoint_02_Dashboard.png",
      "/assets/TrackPoint_03_Orders.png",
      "/assets/TrackPoint_04_OrderDetails.png",
      "/assets/TrackPoint_05_Map.png",
      "/assets/TrackPoint_06_GPSTracking.png",
      "/assets/TrackPoint_07_Delivery.png",
      "/assets/TrackPoint_08_Analytics.png",
      "/assets/TrackPoint_09_Reports.png",
      "/assets/TrackPoint_10_Settings.png",
      "/assets/TrackPoint_11_Profile.png",
      "/assets/TrackPoint_12_Notifications.png",
      "/assets/TrackPoint_13_SyncStatus.png"
    ],
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
    subtitle: "Movie Recommendation System",
    description: "A sophisticated web application that provides personalized movie suggestions using sentiment analysis and external data sources.",
    tags: ["Python", "Django", "JavaScript", "TMDB API", "NLP"],
    image: "/assets/Cinemate.png",
    screenshots: [
      "/assets/Cinemate_01_Homepage.png",
      "/assets/Cinemate_02_Search.png",
      "/assets/Cinemate_03_Recommendations.png",
      "/assets/Cinemate_04_MovieDetail.png",
      "/assets/Cinemate_05_Reviews.png",
      "/assets/Cinemate_06_SentimentAnalysis.png",
      "/assets/Cinemate_07_WishList.png",
      "/assets/Cinemate_08_UserProfile.png",
      "/assets/Cinemate_09_Settings.png",
      "/assets/Cinemate_10_About.png",
      "/assets/Cinemate_11_Dashboard.png",
      "/assets/Cinemate_12_Analytics.png",
      "/assets/Cinemate_13_TrendingMovies.png",
      "/assets/Cinemate_14_GenreFilter.png",
      "/assets/Cinemate_15_SocialSharing.png",
      "/assets/Cinemate_16_Notifications.png",
      "/assets/Cinemate_17_HelpSupport.png"
    ],
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
  },
  {
    id: "splashaquatics",
    title: "Splash Aquatics",
    subtitle: "Online Aquarium Store",
    description: "A full-stack e-commerce platform for aquarium enthusiasts to purchase supplies and manage their aquatic setups.",
    tags: ["Python", "Flask", "JavaScript", "CSS", "MySQL"],
    image: "/assets/SplashAquatics.png",
    screenshots: [
      "/assets/SplashAquatics_01_Homepage.png",
      "/assets/SplashAquatics_02_Classes.png",
      "/assets/SplashAquatics_03_Schedule.png",
      "/assets/SplashAquatics_04_Instructors.png",
      "/assets/SplashAquatics_05_About.png",
      "/assets/SplashAquatics_06_ClassDetail.png",
      "/assets/SplashAquatics_07_Booking.png",
      "/assets/SplashAquatics_08_MemberProfile.png",
      "/assets/SplashAquatics_09_Pricing.png",
      "/assets/SplashAquatics_10_Reviews.png",
      "/assets/SplashAquatics_11_Gallery.png",
      "/assets/SplashAquatics_12_Contact.png",
      "/assets/SplashAquatics_13_FAQ.png",
      "/assets/SplashAquatics_14_Payment.png",
      "/assets/SplashAquatics_15_Confirmation.png"
    ],
    achievements: [
      "⭐ Achieved Distinction grade from the Managing Software Project subject.",
      "Innovated a user-friendly interface tailored for aquarium hobbyists.",
      "Fish tank builder feature enhanced user engagement, fish compatibility checks improved customer satisfaction."
    ],
    overview: "Splashaquatics is a comprehensive online store designed for aquarium enthusiasts, offering a wide range of products and tools to manage aquatic setups effectively. The platform combines e-commerce functionality with specialized features like a fish tank builder to enhance user experience.",
    challenges: [
      "Customers found it difficult to select compatible fish and equipment for their aquariums.",
      "Lack of an intuitive interface led to lower user engagement and higher bounce rates.",
      "Managing inventory and ensuring timely delivery was complex and prone to errors."
    ],
    solutions: [
      "Developed a fish tank builder tool that allows users to design their aquariums and receive compatibility recommendations for fish and equipment.",
      "Implemented a clean, responsive UI using Flask and JavaScript to enhance user experience and engagement.",
      "Optimized inventory management and streamlined delivery processes to reduce errors and improve efficiency."
    ],
    techStackDetails: [
      { category: "Frontend", tools: ["HTML5", "CSS", "JavaScript"] },
      { category: "Backend", tools: ["Python", "Flask", "MySQL"] },
      { category: "AI / ML", tools: ["Custom Algorithms", "Chatbot"] },
      { category: "Data Sources", tools: ["RESTful Services"] }
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
  }
  // {
  //   id: "ds-home",
  //   role: "Logistic Admin",
  //   company: "DS HOME",
  //   period: "2019 - 2020",
  //   description: "Managed inventory logistics and optimized delivery schedules to ensure timely fulfillment.",
  //   skills: ["Logistics Management", "Data Entry", "Scheduling"]
  // }
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
