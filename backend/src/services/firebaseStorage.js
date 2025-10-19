const admin = require("firebase-admin");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  });
}

const bucket = admin.storage().bucket();

// Upload cattle photo to Firebase Storage
const uploadCattlePhoto = async (file, cattleId, organizationId) => {
  try {
    const fileName = `cattle-photos/${organizationId}/${cattleId}/${Date.now()}-${
      file.originalname
    }`;

    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          cattleId,
          organizationId,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    return new Promise((resolve, reject) => {
      stream.on("error", (error) => {
        console.error("Firebase upload error:", error);
        reject(error);
      });

      stream.on("finish", async () => {
        try {
          // Make the file publicly accessible
          await fileUpload.makePublic();

          // Get the public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

          resolve({
            fileName,
            publicUrl,
            size: file.size,
            contentType: file.mimetype,
          });
        } catch (error) {
          reject(error);
        }
      });

      stream.end(file.buffer);
    });
  } catch (error) {
    console.error("Error uploading to Firebase:", error);
    throw error;
  }
};

// Delete cattle photo from Firebase Storage
const deleteCattlePhoto = async (photoUrl) => {
  try {
    if (!photoUrl || !photoUrl.includes("storage.googleapis.com")) {
      return; // Not a Firebase URL, skip deletion
    }

    // Extract file path from URL
    const urlParts = photoUrl.split("/");
    const fileName = urlParts.slice(4).join("/"); // Remove domain parts

    const file = bucket.file(fileName);

    // Check if file exists
    const [exists] = await file.exists();
    if (exists) {
      await file.delete();
      console.log(`Deleted photo: ${fileName}`);
    }
  } catch (error) {
    console.error("Error deleting from Firebase:", error);
    // Don't throw error, just log it
  }
};

// Get signed URL for private access (if needed)
const getSignedUrl = async (fileName, expiresIn = 3600) => {
  try {
    const file = bucket.file(fileName);
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + expiresIn * 1000,
    });
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
};

module.exports = {
  uploadCattlePhoto,
  deleteCattlePhoto,
  getSignedUrl,
};
