import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HIGHLIGHTS_MAP = {
  "full-stack-web-development": [
    "Master modern web technologies: HTML5, CSS3, JavaScript, TypeScript, and React 19",
    "Build full-stack, real-world web apps with Next.js, Node.js, and PostgreSQL",
    "Understand RESTful APIs, database design with Prisma, and secure user authentication",
    "Learn responsive design, Tailwind CSS, component architecture, and state management",
    "Hands-on coding projects, module quizzes, and a comprehensive final capstone project",
    "Full lifetime access with multi-language support (English, Tigrinya, Amharic)"
  ].join("\n"),

  "english-a1": [
    "Learn the English alphabet, phonetics, and basic everyday vocabulary",
    "Master essential greetings, self-introductions, and basic numbers & dates",
    "Construct simple affirmative, negative, and question sentences in present tense",
    "Interactive listening audio practice with Tigrinya & Amharic translations",
    "End-of-lesson quizzes to solidify foundational grammar and vocabulary"
  ].join("\n"),

  "english-a2": [
    "Build conversational fluency for daily routines, shopping, and travel",
    "Master past and future tenses (Simple Past, Present Continuous for future, 'going to')",
    "Expand practical vocabulary to over 1,000 common words and expressions",
    "Listen to authentic dialogs with audio playback and downloadable guides",
    "Practice question forms and everyday conversational structures"
  ].join("\n"),

  "english-b1": [
    "Communicate comfortably on familiar topics encountered in work, school, and leisure",
    "Master present perfect, modal verbs, conditionals (Type 1 & 2), and relative clauses",
    "Express opinions, dreams, hopes, and ambitions with reasoned explanations",
    "Engage with real-life scenario videos and comprehensive comprehension quizzes",
    "Gain confidence speaking and writing structured paragraphs and essays"
  ].join("\n"),

  "english-b2": [
    "Understand complex texts on concrete and abstract topics, including technical discussions",
    "Interact with native speakers with a high degree of fluency and spontaneity",
    "Master advanced grammar: mixed conditionals, passive voice, subjunctive, and inversion",
    "Professional and academic vocabulary for workplace presentations and formal writing",
    "Detailed video explanations with comprehensive exercises and assessments"
  ].join("\n"),

  "english-c1": [
    "Express ideas fluently and spontaneously without searching for expressions",
    "Understand a wide range of demanding, longer texts and recognize implicit meaning",
    "Use language flexibly and effectively for social, academic, and professional purposes",
    "Produce clear, well-structured, detailed text on complex subjects using cohesive devices",
    "Master idiomatic language, collocations, phrasal verbs, and nuanced discourse"
  ].join("\n"),

  "english-c2": [
    "Understand virtually everything heard or read with complete ease",
    "Summarize information from different spoken and written sources, reconstructing arguments coherently",
    "Express yourself spontaneously, very fluently and precisely, differentiating finer shades of meaning",
    "Professional rhetoric, public speaking mastery, academic critique, and literature analysis",
    "Comprehensive capstone exam and certification preparation"
  ].join("\n")
};

async function main() {
  console.log("Seeding course highlights...");
  for (const [slug, highlights] of Object.entries(HIGHLIGHTS_MAP)) {
    const updated = await prisma.course.updateMany({
      where: { slug },
      data: { highlights }
    });
    console.log(`Updated highlights for ${slug}: ${updated.count} course(s) updated.`);
  }
  console.log("Highlights seeding complete!");
}

main()
  .catch((e) => {
    console.error("Error seeding highlights:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
