import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.purchase.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.drop.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding drops...');
  
  const now = new Date();
  
  // Active drop
  const drop1 = await prisma.drop.create({
    data: {
      name: 'Midnight Black Hoodie',
      imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
      totalStock: 50,
      availableStock: 50,
      startAt: new Date(now.getTime() - 1000 * 60 * 60), // Started 1 hour ago
    },
  });

  // Upcoming drop
  const drop2 = await prisma.drop.create({
    data: {
      name: 'Neon Cyber Sneakers',
      imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800',
      totalStock: 100,
      availableStock: 100,
      startAt: new Date(now.getTime() + 1000 * 60 * 60 * 24), // Starts in 1 day
    },
  });

  // Sold out drop
  const drop3 = await prisma.drop.create({
    data: {
      name: 'Limited Edition Cap',
      imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800',
      totalStock: 25,
      availableStock: 0,
      startAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3), // Started 3 days ago
    },
  });

  console.log('Seeding finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
