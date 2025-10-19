const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seedOrganizations() {
  try {
    console.log("🌱 Seeding organizations...");

    // Create test organization
    const testOrg = await prisma.organization.create({
      data: {
        name: "Test Farm Organization",
      },
    });

    // Create customer organization
    const customerOrg = await prisma.organization.create({
      data: {
        name: "Customer Farm Organization",
      },
    });

    console.log("✅ Organizations created:", {
      testOrg: testOrg.id,
      customerOrg: customerOrg.id,
    });

    // Create admin users for each organization
    const hashedPassword = await bcrypt.hash("admin123", 12);

    // Test organization admin
    const testAdmin = await prisma.user.create({
      data: {
        username: "testadmin",
        email: "testadmin@testfarm.com",
        password: hashedPassword,
        role: "ADMIN",
        organizationId: testOrg.id,
      },
    });

    // Customer organization admin
    const customerAdmin = await prisma.user.create({
      data: {
        username: "customeradmin",
        email: "admin@customerfarm.com",
        password: hashedPassword,
        role: "ADMIN",
        organizationId: customerOrg.id,
      },
    });

    // Create regular users for each organization
    const testUser = await prisma.user.create({
      data: {
        username: "testuser",
        email: "testuser@testfarm.com",
        password: hashedPassword,
        role: "USER",
        organizationId: testOrg.id,
      },
    });

    const customerUser = await prisma.user.create({
      data: {
        username: "customeruser",
        email: "user@customerfarm.com",
        password: hashedPassword,
        role: "USER",
        organizationId: customerOrg.id,
      },
    });

    console.log("✅ Users created:", {
      testAdmin: testAdmin.id,
      customerAdmin: customerAdmin.id,
      testUser: testUser.id,
      customerUser: customerUser.id,
    });

    // Create some test cattle for test organization
    const testCattle1 = await prisma.cattle.create({
      data: {
        tagNumber: "TEST001",
        name: "Bella",
        breed: "Holstein",
        gender: "FEMALE",
        dateOfBirth: new Date("2020-01-15"),
        status: "ACTIVE",
        assignedUserId: testUser.id,
        organizationId: testOrg.id,
      },
    });

    const testCattle2 = await prisma.cattle.create({
      data: {
        tagNumber: "TEST002",
        name: "Daisy",
        breed: "Jersey",
        gender: "FEMALE",
        dateOfBirth: new Date("2019-06-20"),
        status: "ACTIVE",
        assignedUserId: testUser.id,
        organizationId: testOrg.id,
      },
    });

    console.log("✅ Test cattle created:", {
      cattle1: testCattle1.id,
      cattle2: testCattle2.id,
    });

    console.log("🎉 Seeding completed successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("Test Organization:");
    console.log("  Admin: testadmin / admin123");
    console.log("  User: testuser / admin123");
    console.log("\nCustomer Organization:");
    console.log("  Admin: customeradmin / admin123");
    console.log("  User: customeruser / admin123");
  } catch (error) {
    console.error("❌ Error seeding organizations:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedOrganizations();
