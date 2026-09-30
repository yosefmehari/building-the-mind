import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      video_url: true,
      highlights: true,
    },
  });

  console.log(`Found ${courses.length} courses:`);
  for (const c of courses) {
    console.log(`[${c.id}] ${c.title} (${c.slug}) -> video_url: ${c.video_url || 'NONE'}`);
  }

  // If Full Stack Web Development doesn't have a video_url, attach a sample preview video URL so we can test end-to-end!
  const fullstack = courses.find((c) => c.slug === 'full-stack-web-development');
  if (fullstack && !fullstack.video_url) {
    console.log('Attaching sample preview video to full-stack-web-development...');
    const updated = await prisma.course.update({
      where: { id: fullstack.id },
      data: {
        // High quality webm/mp4 sample preview video
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      },
    });
    console.log('Updated full-stack course with video_url:', updated.video_url);
  }

  const englishA1 = courses.find((c) => c.slug === 'english-a1');
  if (englishA1 && !englishA1.video_url) {
    console.log('Attaching sample preview video to english-a1...');
    const updated = await prisma.course.update({
      where: { id: englishA1.id },
      data: {
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      },
    });
    console.log('Updated english-a1 course with video_url:', updated.video_url);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
