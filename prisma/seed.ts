import {
  PrismaClient,
  Role,
  ApplicationStatus,
  TaskStatus,
  TaskPriority,
  DocCategory,
  LiquidationStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Cleaning up database...");
  await prisma.userBadge.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.pointTransaction.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.eventRegistration.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.liquidation.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.committee.deleteMany({});

  console.log("🌱 Creating Committees...");
  const commExec = await prisma.committee.create({
    data: {
      name: "Executive Board",
      description: "President, Vice Presidents, Secretary, and Treasurer.",
    },
  });

  const commMarketing = await prisma.committee.create({
    data: {
      name: "Marketing",
      description: "Public relations, social media layouts, and branding.",
    },
  });

  const commLogistics = await prisma.committee.create({
    data: {
      name: "Logistics",
      description: "Event reservations, floor plans, and technical operations.",
    },
  });

  const commFinance = await prisma.committee.create({
    data: {
      name: "Finance",
      description: "Sponsorship acquisitions, budgeting, and liquidations.",
    },
  });

  const commTech = await prisma.committee.create({
    data: {
      name: "Technology",
      description: "Development and maintenance of organization systems.",
    },
  });

  console.log("🌱 Creating Users...");
  const userAdmin = await prisma.user.create({
    data: {
      email: "admin@g.edu",
      name: "Alex Admin",
      role: Role.ADMIN,
      department: "Operations",
      yearLevel: 4,
      course: "BS Computer Science",
      committeeId: commExec.id,
      totalPoints: 120,
    },
  });

  const userOfficer = await prisma.user.create({
    data: {
      email: "officer@g.edu",
      name: "Olly Officer",
      role: Role.OFFICER,
      department: "Marketing",
      yearLevel: 3,
      course: "BS Business Administration",
      committeeId: commMarketing.id,
      totalPoints: 85,
    },
  });

  const userMember = await prisma.user.create({
    data: {
      email: "member@g.edu",
      name: "Max Member",
      role: Role.MEMBER,
      department: "Marketing",
      yearLevel: 2,
      course: "BS Information Technology",
      committeeId: commMarketing.id,
      totalPoints: 35,
    },
  });

  const userAlumni = await prisma.user.create({
    data: {
      email: "alumni@g.edu",
      name: "Alice Alumni",
      role: Role.ALUMNI,
      department: "Technology",
      yearLevel: 4,
      course: "BS Computer Engineering",
      committeeId: commTech.id,
      totalPoints: 0,
    },
  });

  const userApplicant = await prisma.user.create({
    data: {
      email: "applicant@g.edu",
      name: "Andy Applicant",
      role: Role.APPLICANT,
      department: "Admissions",
      yearLevel: 1,
      course: "BS Software Engineering",
      totalPoints: 0,
    },
  });

  console.log("🌱 Creating Tasks...");
  await prisma.task.createMany({
    data: [
      {
        title: "Design recruitment poster",
        description: "Draft standard layouts for social media postings.",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        committeeId: commMarketing.id,
        assigneeId: userMember.id,
        creatorId: userOfficer.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
      },
      {
        title: "Finalize budget allocation",
        description: "Submit allocations for the upcoming General Assembly.",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        committeeId: commExec.id,
        assigneeId: userAdmin.id,
        creatorId: userAdmin.id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days later
      },
      {
        title: "Update Constitution bylaws v2",
        description: "Refactor article IV to include roles for alumni advisors.",
        status: TaskStatus.UNDER_REVIEW,
        priority: TaskPriority.MEDIUM,
        committeeId: commExec.id,
        assigneeId: userAdmin.id,
        creatorId: userAdmin.id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Set up sign-in tables",
        description: "Prepare check-in QR printed stands and member sheets.",
        status: TaskStatus.DONE,
        priority: TaskPriority.LOW,
        committeeId: commLogistics.id,
        assigneeId: userMember.id,
        creatorId: userOfficer.id,
        deliverable: "https://example.com/logistics-setup-doc",
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    ],
  });

  console.log("🌱 Creating Events...");
  const eventGA = await prisma.event.create({
    data: {
      title: "General Assembly & Kickoff",
      description: "First general meeting of the academic year. Welcome, game night, and updates.",
      location: "Auditorium A & Zoom",
      pointsValue: 15,
      startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      qrSecret: "ga-kickoff-secret-token",
    },
  });

  const eventWorkshop = await prisma.event.create({
    data: {
      title: "Logistics Sync Workshop",
      description: "Hands-on training session on university booking and safety guidelines.",
      location: "Room 304",
      pointsValue: 10,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      qrSecret: "logistics-workshop-secret-token",
    },
  });

  console.log("🌱 Creating Event Registrations & Attendances...");
  // Register member for GA and Workshop
  await prisma.eventRegistration.createMany({
    data: [
      {
        eventId: eventGA.id,
        userId: userMember.id,
        rsvpStatus: true,
        volunteerRole: "Technical Assistant",
      },
      {
        eventId: eventWorkshop.id,
        userId: userMember.id,
        rsvpStatus: true,
      },
      {
        eventId: eventGA.id,
        userId: userOfficer.id,
        rsvpStatus: true,
        volunteerRole: "Event Facilitator",
      },
    ],
  });

  // GA Attendance check-in
  await prisma.attendance.create({
    data: {
      eventId: eventGA.id,
      userId: userMember.id,
      checkInTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000), // 10 mins after start
      isManual: false,
    },
  });

  console.log("🌱 Creating Point Transactions...");
  await prisma.pointTransaction.createMany({
    data: [
      {
        userId: userMember.id,
        points: 15,
        reason: "Attended General Assembly & Kickoff",
        approvedById: userAdmin.id,
      },
      {
        userId: userMember.id,
        points: 20,
        reason: "Completed Logistics sign-in setup task",
        approvedById: userOfficer.id,
      },
      {
        userId: userOfficer.id,
        points: 25,
        reason: "Facilitated GA and organized slide decks",
        approvedById: userAdmin.id,
      },
    ],
  });

  console.log("🌱 Creating Announcements...");
  await prisma.announcement.createMany({
    data: [
      {
        title: "Constitution Vote Scheduled",
        content: "We will vote on the proposed version 2 constitution draft this coming Friday at 5:00 PM. Please review the docs in the archive before then.",
        isPinned: true,
        authorId: userAdmin.id,
      },
      {
        title: "Welcome to CampusNode!",
        content: "CampusNode is now live! Use the task boards and dynamic QR code system for our check-ins.",
        isPinned: false,
        authorId: userAdmin.id,
      },
      {
        title: "Alumni Homecoming RSVP",
        content: "Alumni outreach newsletter composer is ready. Calling all graduated members to sign up for our annual homecoming dinner.",
        isPinned: false,
        isAlumniTarget: true,
        authorId: userAdmin.id,
      },
    ],
  });

  console.log("🌱 Creating Documents...");
  await prisma.document.createMany({
    data: [
      {
        title: "Organization Constitution 2026",
        url: "https://example.com/constitution-2026.pdf",
        category: DocCategory.CONSTITUTION,
        tags: ["constitution", "bylaws", "governance"],
        uploaderId: userAdmin.id,
      },
      {
        title: "Event Booking SOP",
        url: "https://example.com/booking-sop.pdf",
        category: DocCategory.SOP,
        tags: ["booking", "logistics", "auditorium"],
        committeeId: commLogistics.id,
        uploaderId: userOfficer.id,
      },
      {
        title: "GA Kickoff Minutes",
        url: "https://example.com/ga-kickoff-minutes.pdf",
        category: DocCategory.MINUTES,
        tags: ["minutes", "kickoff", "general-assembly"],
        uploaderId: userAdmin.id,
      },
    ],
  });

  console.log("🌱 Creating Badges & User Badges...");
  const badgeActive = await prisma.badge.create({
    data: {
      name: "Active Contributor",
      description: "Earn 10 points or more through events and tasks.",
      iconUrl: "🏆",
      pointsLimit: 10,
    },
  });

  const badgeLogistics = await prisma.badge.create({
    data: {
      name: "Logistics Guru",
      description: "Help coordinate at least one Logistics operations shift.",
      iconUrl: "📦",
      pointsLimit: 20,
    },
  });

  const badgePerfect = await prisma.badge.create({
    data: {
      name: "Perfect Attendance",
      description: "Reach 50 attendance points.",
      iconUrl: "✨",
      pointsLimit: 50,
    },
  });

  await prisma.userBadge.create({
    data: {
      userId: userMember.id,
      badgeId: badgeActive.id,
    },
  });

  console.log("🌱 Seeding Liquidations...");
  await prisma.liquidation.create({
    data: {
      userId: userOfficer.id,
      amount: 125.5,
      description: "Snacks and printing paper for GA kickoff event.",
      receiptUrl: "https://example.com/receipt-ga-kickoff.png",
      status: LiquidationStatus.PENDING,
    },
  });

  console.log("🌱 Seeding Applications...");
  await prisma.application.create({
    data: {
      userId: userApplicant.id,
      status: ApplicationStatus.APPLIED,
      formResponse: {
        preferredCommittee: "Technology",
        statementOfPurpose: "I want to help design student workspace applications and learn full-stack development.",
        skills: "Basic HTML, CSS, JavaScript, Python",
      },
    },
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
