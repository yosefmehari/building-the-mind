import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const englishLevels = [
  {
    code: "A1",
    label: "Beginner",
    description: "Build your foundation with essential words, phrases, and simple conversations.",
    modules: [
      ["Getting Started in English", ["Greetings and introductions", "The alphabet and spelling", "Numbers, dates, and time", "Classroom English"]],
      ["Everyday Vocabulary", ["Family and friends", "Home and daily routines", "Food and drinks", "Places in town"]],
      ["Basic Communication", ["Present simple sentences", "Questions and short answers", "Can, can't, and imperatives", "A1 review and practice"]],
    ],
  },
  {
    code: "A2",
    label: "Elementary",
    description: "Communicate in everyday situations and describe your experiences with confidence.",
    modules: [
      ["Daily Life and Conversation", ["Past simple essentials", "Free time and hobbies", "Shopping and prices", "Making plans"]],
      ["Travel and Places", ["Transport and directions", "Hotels and restaurants", "Describing places", "Travel problems"]],
      ["Building Better Sentences", ["Countable and uncountable nouns", "Comparatives and superlatives", "Future plans", "A2 review and practice"]],
    ],
  },
  {
    code: "B1",
    label: "Intermediate",
    description: "Express opinions, tell stories, and handle familiar work and travel situations.",
    modules: [
      ["Stories and Experiences", ["Narrative tenses", "Life experiences", "Explaining problems", "Telling an engaging story"]],
      ["Work and Travel", ["Workplace communication", "Travel and cultural experiences", "Requests and recommendations", "Professional messages"]],
      ["Clearer Communication", ["First and second conditionals", "Modal verbs for advice", "Linking ideas", "B1 review and practice"]],
    ],
  },
  {
    code: "B2",
    label: "Upper-Intermediate",
    description: "Discuss complex ideas, follow natural speech, and communicate fluently in professional contexts.",
    modules: [
      ["Fluent Conversation", ["Nuanced opinions", "Agreeing and disagreeing", "Natural conversation strategies", "Presentations and discussions"]],
      ["Advanced Grammar in Use", ["Perfect and continuous forms", "Passive and causative structures", "Reported speech", "Mixed conditionals"]],
      ["Professional English", ["Meetings and negotiation", "Reports and proposals", "Tone and register", "B2 review and practice"]],
    ],
  },
  {
    code: "C1",
    label: "Advanced",
    description: "Use precise, flexible English for academic, professional, and complex social situations.",
    modules: [
      ["Precision and Style", ["Collocations and fixed expressions", "Meaning and nuance", "Formal and informal register", "Editing for clarity"]],
      ["Academic and Professional Skills", ["Structuring an argument", "Synthesising sources", "Presenting complex information", "Writing persuasive proposals"]],
      ["Complex Communication", ["Inversion and emphasis", "Hedging and cautious language", "Idiomatic language", "C1 review and practice"]],
    ],
  },
  {
    code: "C2",
    label: "Mastery",
    description: "Refine near-native control, interpret subtle meaning, and communicate with exceptional precision.",
    modules: [
      ["Mastering Meaning", ["Subtle distinctions in vocabulary", "Implicit meaning and inference", "Humour, irony, and tone", "Language in context"]],
      ["Expert Communication", ["High-level debate", "Complex negotiation", "Academic and creative writing", "Adapting voice and style"]],
      ["Fluency and Refinement", ["Advanced idioms and metaphor", "Rhetorical techniques", "Polished presentations", "C2 final review"]],
    ],
  },
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

try {
  for (const levelData of englishLevels) {
    const level = await db.levels.upsert({
      where: { name: levelData.code },
      update: { description: levelData.description },
      create: { name: levelData.code, description: levelData.description },
    });

    const course = await db.course.upsert({
      where: { slug: `english-${levelData.code.toLowerCase()}` },
      update: {
        title: `English ${levelData.code}: ${levelData.label}`,
        description: levelData.description,
        level_id: level.id,
        published: true,
        featured: levelData.code === "A1",
        is_free: true,
      },
      create: {
        title: `English ${levelData.code}: ${levelData.label}`,
        slug: `english-${levelData.code.toLowerCase()}`,
        description: levelData.description,
        level_id: level.id,
        published: true,
        featured: levelData.code === "A1",
        is_free: true,
      },
    });

    for (const [moduleIndex, [moduleTitle, lessons]] of levelData.modules.entries()) {
      let moduleRecord = await db.module.findFirst({
        where: { course_id: course.id, title: moduleTitle },
      });
      if (moduleRecord) {
        moduleRecord = await db.module.update({
          where: { id: moduleRecord.id },
          data: { position: moduleIndex, published: true },
        });
      } else {
        moduleRecord = await db.module.create({
          data: { course_id: course.id, title: moduleTitle, position: moduleIndex, published: true },
        });
      }

      for (const [lessonIndex, lessonTitle] of lessons.entries()) {
        await db.lesson.upsert({
          where: { module_id_slug: { module_id: moduleRecord.id, slug: slugify(lessonTitle) } },
          update: { title: lessonTitle, position: lessonIndex, published: true },
          create: {
            module_id: moduleRecord.id,
            title: lessonTitle,
            slug: slugify(lessonTitle),
            position: lessonIndex,
            published: true,
            is_free: true,
          },
        });
      }
    }

    console.log(`Seeded ${course.title}`);
  }
} finally {
  await db.$disconnect();
}
