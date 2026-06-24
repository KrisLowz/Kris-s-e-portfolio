import { Skill } from '../types';

export const SKILLS: Skill[] = [
  { id: 'skill-html5', name: 'HTML5', iconClass: 'devicon-html5-plain colored', ring: 'inner', category: 'Frontend · Markup', blurb: 'Semantic structure under every web UI I build.', usedIn: ['cinemate', 'splashaquatics'], level: 4 },
  { id: 'skill-css3', name: 'CSS3', iconClass: 'devicon-css3-plain colored', ring: 'inner', category: 'Frontend · Styling', blurb: 'Hand-built layouts, responsive design, and motion.', usedIn: ['cinemate', 'splashaquatics'], level: 4 },
  { id: 'skill-javascript', name: 'JavaScript', iconClass: 'devicon-javascript-plain colored', ring: 'inner', category: 'Frontend · Language', blurb: 'Interactivity across all my web projects.', usedIn: ['cinemate', 'splashaquatics'], level: 4 },
  { id: 'skill-python', name: 'Python', iconClass: 'devicon-python-plain colored', ring: 'inner', category: 'Backend · Language', blurb: 'My go-to for backend logic, data, and ML glue.', usedIn: ['cinemate', 'splashaquatics'], level: 4 },
  { id: 'skill-java', name: 'Java', iconClass: 'devicon-java-plain colored', ring: 'inner', category: 'Language', blurb: 'OOP foundation from coursework and Android roots.', usedIn: [], level: 3 },
  { id: 'skill-cpp', name: 'C++', iconClass: 'devicon-cplusplus-plain colored', ring: 'inner', category: 'Language', blurb: 'Systems-level problem solving and algorithms.', usedIn: [], level: 3 },
  { id: 'skill-csharp', name: 'C#', iconClass: 'devicon-csharp-plain colored', ring: 'inner', category: 'Language', blurb: 'OOP and .NET coursework.', usedIn: [], level: 3 },
  { id: 'skill-sql', name: 'SQL', iconClass: 'devicon-mysql-plain colored', ring: 'inner', category: 'Data · Query', blurb: 'Relational queries behind my full-stack apps.', usedIn: ['splashaquatics'], level: 4 },
  { id: 'skill-figma', name: 'Figma', iconClass: 'devicon-figma-plain colored', ring: 'outer', category: 'Design · Tool', blurb: 'Wireframes and prototypes before I build.', usedIn: ['trackpoint'], level: 3 },
  { id: 'skill-tailwind', name: 'Tailwind CSS', iconClass: 'devicon-tailwindcss-original colored', ring: 'outer', category: 'Frontend · Styling', blurb: 'Utility-first styling for fast, consistent UI.', usedIn: [], level: 3 },
  { id: 'skill-postgresql', name: 'PostgreSQL', iconClass: 'devicon-postgresql-plain colored', ring: 'outer', category: 'Data · Database', blurb: 'Relational data modeling and queries.', usedIn: [], level: 3 },
  { id: 'skill-firebase', name: 'Firebase', iconClass: 'devicon-firebase-plain colored', ring: 'outer', category: 'Backend · BaaS', blurb: 'Realtime sync and auth that powered TrackPoint.', usedIn: ['trackpoint'], level: 4 },
  { id: 'skill-kotlin', name: 'Kotlin', iconClass: 'devicon-kotlin-plain colored', ring: 'outer', category: 'Mobile · Language', blurb: 'My primary Android language — built TrackPoint with it.', usedIn: ['trackpoint'], level: 4 },
  { id: 'skill-flutter', name: 'Flutter', iconClass: 'devicon-flutter-plain colored', ring: 'outer', category: 'Mobile · Framework', blurb: 'Cross-platform mobile UI.', usedIn: [], level: 3 },
  { id: 'skill-android', name: 'Android', iconClass: 'devicon-android-plain colored', ring: 'outer', category: 'Mobile · Platform', blurb: 'Native Android app development.', usedIn: ['trackpoint'], level: 4 },
  { id: 'skill-git', name: 'Git', iconClass: 'devicon-git-plain colored', ring: 'outer', category: 'Tooling · VCS', blurb: 'Version control on every project I touch.', usedIn: [], level: 4 },
  { id: 'skill-vscode', name: 'VS Code', iconClass: 'devicon-vscode-plain colored', ring: 'outer', category: 'Tooling · Editor', blurb: 'My daily driver editor.', usedIn: [], level: 4 },
];
