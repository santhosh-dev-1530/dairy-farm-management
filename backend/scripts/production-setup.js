#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function productionSetup() {
  try {
    console.log("🚀 Setting up production environment...");

    // Check if organizations already exist
    const existingOrgs = await prisma.organization.findMany();

    if (existingOrgs.length > 0) {
      console.log("✅ Organizations already exist, skipping setup");
      console.log("📋 Available organizations:");
      existingOrgs.forEach((org) => {
        console.log(`  - ${org.name} (ID: ${org.id})`);
      });
      return;
    }

    console.log("🌱 Creating production organizations...");

    // Create production organizations
    const testOrg = await prisma.organization.create({
      data: {
        name: "Test Farm Organization",
      },
    });

    const customerOrg = await prisma.organization.create({
      data: {
        name: "Customer Farm Organization",
      },
    });

    console.log("✅ Organizations created");

    // Create admin users
    const hashedPassword = await bcrypt.hash("admin123", 12);

    const testAdmin = await prisma.user.create({
      data: {
        username: "testadmin",
        email: "testadmin@testfarm.com",
        password: hashedPassword,
        role: "ADMIN",
        organizationId: testOrg.id,
      },
    });

    const customerAdmin = await prisma.user.create({
      data: {
        username: "customeradmin",
        email: "admin@customerfarm.com",
        password: hashedPassword,
        role: "ADMIN",
        organizationId: customerOrg.id,
      },
    });

    // Create regular users
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

    console.log("✅ Users created");

    // Create sample cattle for test organization
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

    console.log("✅ Sample cattle created");

    console.log("\n🎉 Production setup completed successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("\n🧪 Test Organization (for development):");
    console.log("  Admin: testadmin / admin123");
    console.log("  User: testuser / admin123");
    console.log("\n🏢 Customer Organization (for clients):");
    console.log("  Admin: customeradmin / admin123");
    console.log("  User: customeruser / admin123");

    console.log("\n🌐 Your production API will be available at:");
    console.log("  https://your-app-name.onrender.com/api");

    console.log("\n📱 To generate APK for clients:");
    console.log("  cd mobile/android && ./gradlew assembleRelease");
  } catch (error) {
    console.error("❌ Error setting up production:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
productionSetup();
