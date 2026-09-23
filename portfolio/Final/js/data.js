/* =====================================================================
   data.js — ALL of your personal content lives here.
   Edit this file to add projects, skills, timeline entries, achievements.
   You do not need to touch script.js or style.css for normal updates.
   ===================================================================== */

window.SITE = {

  /* ---------- LINKS (edit these first) ---------- */
  links: {
    github:   "https://github.com/rohityadav-RY",
    linkedin: "https://www.linkedin.com/in/rohit-ydav/",
    leetcode: "https://leetcode.com/u/rohityadav_ry/",
    hackerrank: "https://www.hackerrank.com/profile/rohityadav_forai",
    email:    "",   // TODO: add your email, e.g. "you@example.com". Empty = "coming soon" is shown.
    resume:   "",   // TODO: e.g. "assets/resume/Rohit_Y_Resume.pdf". Empty = no resume link shown.
    formEndpoint: "" // TODO: paste a Formspree URL (https://formspree.io/f/xxxx) to make the form send. See README.
  },

  /* ---------- SITE IMAGES ----------
     portrait: put YOUR photo at assets/images/rohit.jpg (square works best).
               Until the file exists, a monogram is shown instead.
     The other images are original code-editor artwork made for this site.  */
  images: {
    portrait: "assets/images/rohit.jpg",
    about:    "assets/images/about.jpg",
    terminal: "assets/images/terminal.jpg",
    skills:   "assets/images/skills.jpg"
  },

  /* ---------- PROJECTS ----------
     To add a project: copy one object below, change the fields, keep the comma.
     short: the name shown in the big project list
     image: shown inside the circle (use a screenshot or artwork, square is best)
     live:  only fill this if you have a REAL working demo URL.            */
  projects: [
    {
      id: "jard",
      short: "JARD",
      title: "JARD — Document Intelligence Platform",
      kicker: "Team project · Exasol AI Build Challenge 2026",
      badge: "Second prize · Exasol AI Build Challenge 2026 (team)",
      summary:
        "An agentic document-intelligence platform. It extracts structured fields from documents, sends uncertain ones to a human, compares related documents to catch discrepancies, and lets anyone question the results in plain English — backed by Exasol.",
      tags: ["Python", "Flask", "Exasol", "Ollama", "Tesseract OCR", "HTML", "JavaScript"],
      repo: "https://github.com/rohityadav-RY/JARD-document-intelligence",
      demoVideo: "https://youtu.be/M_TS8T7-XnE",
      live: "",
      image: "assets/images/jard.jpg",
      imageAlt: "Screenshot of the JARD document intelligence platform landing page",
      case: [
        { h: "The problem",
          p: "Reading text from PDFs and scans is largely solved. What most tools don’t do is reason across related documents in the same case — an invoice, its purchase order and its contract, for example — and turn what they find into a next step a person can approve." },
        { h: "The approach",
          p: "Documents are ingested (native PDF text, or OCR for scans and images) and fields are extracted with a confidence score. A deterministic gate sends uncertain fields to human review. Related documents are grouped into a case and compared for discrepancies, and an action is drafted for a human to approve — nothing is sent automatically." },
        { h: "Ask in plain English",
          p: "A chat agent turns a question into validated, read-only SQL that runs against Exasol under a SELECT-only database identity. Every agent step is written to an audit log so results can be traced." },
        { h: "My part",
          p: "I built the frontend: a landing page and a dashboard for uploads, review, discrepancies, proposed actions and chat, written in plain HTML and JavaScript and served by the project’s Flask app." }
      ]
    },
    {
      id: "skill-tracker",
      short: "Skill Tracker",
      title: "Skill Tracker",
      kicker: "Personal project · Open source",
      badge: "",
      summary:
        "A web app for students to log, monitor and level up their skills. Every skill earns XP towards its next level, a daily log records what you practised, and ranks from Rookie to Elite make progress visible.",
      tags: ["HTML", "CSS", "JavaScript"],
      repo: "https://github.com/rohityadav-RY/Skill_Tracker",
      demoVideo: "",
      live: "",
      image: "assets/images/skill-tracker.jpg",
      imageAlt: "Skill Tracker dashboard concept with progress cards and weekly activity chart",
      case: [
        { h: "What it does",
          p: "Students add the skills they are building and log tasks against them. Each skill collects XP towards the next level, and an overview shows skills tracked, total XP, tasks logged, skills at max level and the current streak." },
        { h: "Designed to motivate",
          p: "It borrows from gamification: level progress bars, a 15-day activity view, suggested skills to start with, and four ranks — Rookie, Intermediate, Pro and Elite." },
        { h: "Where it stands",
          p: "It is open source and still early. The repository holds two versions (0.0.1 and 0.0.2), each a single HTML page." }
      ]
    }
    // ← Add your next project here (copy an object above).
  ],

  /* ---------- JOURNEY (timeline) ----------
     Add entries in order. type: "milestone" (default) or "award" (filled node). */
  timeline: [
    { when: "Year 1", title: "Began B.Tech CSE at VIT Chennai",
      text: "Started my Computer Science and Engineering degree." },
    { when: "Python", title: "Building with Python",
      text: "Learning by making practical projects, starting with Skill Tracker." },
    { when: "2026", title: "JARD · Exasol AI Build Challenge", type: "award",
      text: "Built the frontend for our team’s document-intelligence platform; the project received second prize." },
    { when: "Now", title: "Learning HTML, CSS and JavaScript",
      text: "Moving into frontend development — this portfolio is part of that." }
    // ← Add future internships, experience or events here.
  ],

  /* ---------- ACHIEVEMENTS ----------
     Only verified items. `proof` is optional: a link to a certificate or post. */
  achievements: [],

  /* ---------- SKILLS ----------
     No percentages on purpose. Move an item from `learning` to `current`
     when you feel ready. Add new ones as { name: "..." }.                */
  skills: {
    current:  [ { name: "Python" } ],
    learning: [ { name: "HTML" }, { name: "CSS" }, { name: "JavaScript" } ]
  }
};
