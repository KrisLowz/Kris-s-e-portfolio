import { GoogleGenAI } from "@google/genai";

/**
 * CONFIGURATION
 * Replace the string below with your actual Gemini API Key for the chatbot to work.
 * WARNING: On public GitHub Pages, this key will be visible to anyone viewing source.
 * Restrict usage in Google AI Studio to your domain.
 */
const API_KEY = ""; 

/**
 * DATA STORE
 * Content for the detailed modals and AI Context.
 */
const PROJECT_DATA = {
    "trackpoint": {
        title: "TrackPoint",
        subtitle: "Sales Performance & GPS Tracker",
        image: "https://picsum.photos/800/450?grayscale",
        overview: "TrackPoint is a comprehensive mobile solution designed for HuaChang Growmax to modernize their traditional sales and logistics operations. By replacing manual paper records with a digital system, the app streamlines order management and provides real-time visibility into the supply chain.",
        link: "#",
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
        techStack: {
            "Mobile": ["Kotlin", "Jetpack Compose", "Android SDK"],
            "Backend": ["Firebase Realtime DB", "Cloud Functions", "Authentication"],
            "Services": ["Google Maps SDK", "Google Places API"],
            "Architecture": ["MVVM Pattern", "Repository Pattern", "Coroutines"]
        }
    },
    "cinemate": {
        title: "Cinemate",
        subtitle: "AI-Powered Movie Recommendation",
        image: "https://picsum.photos/800/451?grayscale",
        overview: "Cinemate is an intelligent movie discovery platform that leverages natural language processing to understand user preferences. Unlike traditional collaborative filtering, Cinemate analyzes the sentiment behind user reviews to recommend movies that match a specific emotional tone.",
        link: "#",
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
        techStack: {
            "Frontend": ["HTML5", "Tailwind CSS", "JavaScript"],
            "Backend": ["Python", "Django MTV", "SQLite"],
            "AI / ML": ["NLTK", "TextBlob", "Scikit-learn"],
            "Data Sources": ["TMDB API", "RESTful Services"]
        }
    }
};

const SYSTEM_INSTRUCTION = `
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
`;

/* ================= THEME TOGGLE ================= */
const themeToggleBtn = document.getElementById('theme-toggle');
const themeToggleBtnMobile = document.getElementById('theme-toggle-mobile');
const htmlEl = document.documentElement;

// Function to handle switching
function toggleTheme() {
    if (htmlEl.classList.contains('dark')) {
        htmlEl.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        htmlEl.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
}

if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
if (themeToggleBtnMobile) themeToggleBtnMobile.addEventListener('click', toggleTheme);


/* ================= NAVBAR SCROLL ================= */
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            // Scrolled state: Solid background with blur
            navbar.classList.add('bg-white/95', 'dark:bg-slate-950/95', 'backdrop-blur-md', 'shadow-sm', 'dark:shadow-none', 'border-slate-200', 'dark:border-slate-800');
            // Remove transparent state
            navbar.classList.remove('py-6', 'bg-transparent', 'border-transparent');
            // Ensure padding is smaller
            navbar.classList.add('py-4');
        } else {
            // Top state: Transparent
            navbar.classList.remove('bg-white/95', 'dark:bg-slate-950/95', 'backdrop-blur-md', 'shadow-sm', 'dark:shadow-none', 'border-slate-200', 'dark:border-slate-800', 'py-4');
            // Add transparent state
            navbar.classList.add('py-6', 'bg-transparent', 'border-transparent');
        }
    });
}

/* ================= MOBILE MENU ================= */
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        // Update icon
        const icon = menuBtn.querySelector('i');
        if (mobileMenu.classList.contains('hidden')) {
            icon.setAttribute('data-lucide', 'menu');
        } else {
            icon.setAttribute('data-lucide', 'x');
        }
        lucide.createIcons();
    });

    // Close menu when clicking link
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            menuBtn.querySelector('i').setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        });
    });
}

/* ================= PROJECT MODAL ================= */
const modal = document.getElementById('project-modal');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');
const modalBackdrop = document.getElementById('modal-backdrop');
const triggers = document.querySelectorAll('.project-trigger');

function openModal(projectId) {
    const project = PROJECT_DATA[projectId];
    if (!project) return;

    // Generate HTML
    let html = `
        <!-- Header -->
        <div class="relative h-64 sm:h-80 w-full flex-shrink-0">
            <img src="${project.image}" alt="${project.title}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-90"></div>
            <div class="absolute bottom-0 left-0 w-full p-8">
                <h2 class="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">${project.title}</h2>
                <p class="text-brand-primary font-medium text-lg md:text-xl">${project.subtitle}</p>
            </div>
        </div>

        <div class="p-8 space-y-10">
            <!-- Overview -->
            <section>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <i data-lucide="rocket" class="w-5 h-5 text-brand-primary"></i> Project Overview
                </h3>
                <p class="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">${project.overview}</p>
            </section>

            <!-- Challenges vs Solutions -->
            <div class="grid md:grid-cols-2 gap-8">
                <section class="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/20">
                    <div class="flex items-center gap-2 mb-4 text-red-600 dark:text-red-400">
                        <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                        <h3 class="text-lg font-bold">The Challenges</h3>
                    </div>
                    <ul class="space-y-4">
                        ${project.challenges.map(c => `
                            <li class="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-sm">
                                <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                                <span class="leading-relaxed">${c}</span>
                            </li>
                        `).join('')}
                    </ul>
                </section>

                <section class="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                    <div class="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                        <i data-lucide="check-circle" class="w-5 h-5"></i>
                        <h3 class="text-lg font-bold">The Solutions</h3>
                    </div>
                    <ul class="space-y-4">
                         ${project.solutions.map(s => `
                            <li class="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-sm">
                                <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                                <span class="leading-relaxed">${s}</span>
                            </li>
                        `).join('')}
                    </ul>
                </section>
            </div>

            <!-- Tech Stack -->
            <section>
                 <div class="flex items-center gap-2 mb-6 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-4">
                    <i data-lucide="layers" class="w-5 h-5 text-brand-primary"></i>
                    <h3 class="text-xl font-bold">Tech Stack Breakdown</h3>
                  </div>
                  <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                    ${Object.entries(project.techStack).map(([category, tools]) => `
                        <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-primary/30 transition-colors">
                            <h4 class="text-sm font-bold text-brand-primary mb-3 uppercase tracking-wider">${category}</h4>
                            <ul class="space-y-2">
                                ${tools.map(tool => `
                                    <li class="text-sm text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                        <div class="w-1 h-1 bg-slate-400 rounded-full"></div>
                                        ${tool}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    `).join('')}
                  </div>
            </section>
        </div>
    `;

    modalContent.innerHTML = html;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
}

function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = 'unset';
    modalContent.innerHTML = '';
}

if (triggers) {
    triggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Find closest button if clicked on icon/text
            const target = e.target.closest('button') || e.target.closest('.project-trigger');
            const id = target.getAttribute('data-id');
            openModal(id);
        });
    });
}

if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        closeModal();
    }
});


/* ================= CHAT BOT ================= */
const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const closeChat = document.getElementById('close-chat');
const chatInput = document.getElementById('chat-input');
const sendChat = document.getElementById('send-chat');
const chatMessages = document.getElementById('chat-messages');

let chatHistory = [
    { role: 'model', parts: [{ text: "Hi! I'm Chee Fei's AI assistant. Ask me about his projects, skills, or experience!" }] }
];

function renderMessages() {
    if (!chatMessages) return;
    chatMessages.innerHTML = '';
    chatHistory.forEach(msg => {
        const isUser = msg.role === 'user';
        const div = document.createElement('div');
        div.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
        div.innerHTML = `
            <div class="max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                isUser 
                ? 'bg-brand-primary text-slate-900 font-medium rounded-tr-none' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none'
            }">
                ${msg.parts[0].text}
            </div>
        `;
        chatMessages.appendChild(div);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initial render
renderMessages();

if (chatToggle && chatWindow) {
    chatToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        const icon = chatToggle.querySelector('i');
        if (chatWindow.classList.contains('hidden')) {
            chatToggle.classList.remove('rotate-90', 'bg-slate-700');
            chatToggle.classList.add('bg-brand-primary');
            icon.setAttribute('data-lucide', 'message-circle');
        } else {
            chatToggle.classList.add('rotate-90', 'bg-slate-700');
            chatToggle.classList.remove('bg-brand-primary');
            icon.setAttribute('data-lucide', 'x');
        }
        lucide.createIcons();
    });
}

if (closeChat) {
    closeChat.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
        chatToggle.classList.remove('rotate-90', 'bg-slate-700');
        chatToggle.classList.add('bg-brand-primary');
        chatToggle.querySelector('i').setAttribute('data-lucide', 'message-circle');
        lucide.createIcons();
    });
}

async function handleSendMessage() {
    if (!chatInput) return;
    const text = chatInput.value.trim();
    if (!text) return;

    if (!API_KEY) {
        chatHistory.push({ role: 'user', parts: [{ text }] });
        chatHistory.push({ role: 'model', parts: [{ text: "AI is currently disabled (Missing API Key). Please replace 'API_KEY' in script.js to enable." }] });
        chatInput.value = '';
        renderMessages();
        return;
    }

    // Add User Message
    chatHistory.push({ role: 'user', parts: [{ text }] });
    renderMessages();
    chatInput.value = '';
    
    // Loading State
    const loadingDiv = document.createElement('div');
    loadingDiv.className = "flex justify-start";
    loadingDiv.innerHTML = `
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
             <span class="text-xs text-slate-500 dark:text-slate-400">Thinking...</span>
        </div>
    `;
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        
        // Correct API Usage for Gemini SDK
        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: SYSTEM_INSTRUCTION
            },
            history: chatHistory.slice(0, -1) // Pass history excluding the message we are about to send
        });

        // Use send message
        const result = await chat.sendMessage({ message: text });
        const responseText = result.text; // Access text property directly

        // Remove loading
        chatMessages.removeChild(loadingDiv);

        // Add Model Response
        chatHistory.push({ role: 'model', parts: [{ text: responseText }] });
        renderMessages();

    } catch (error) {
        console.error("Gemini Error:", error);
        if (loadingDiv.parentNode) chatMessages.removeChild(loadingDiv);
        chatHistory.push({ role: 'model', parts: [{ text: "Sorry, I encountered an error. Please check your API Key and try again." }] });
        renderMessages();
    }
}

if (sendChat) sendChat.addEventListener('click', handleSendMessage);
if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });
}