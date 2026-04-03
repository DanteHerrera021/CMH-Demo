const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("node:crypto");

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { DeleteObjectsCommand } = require("@aws-sdk/client-s3");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ maxInstances: 10 });

const awsAccessKeyId = defineSecret("AWS_ACCESS_KEY_ID");
const awsSecretAccessKey = defineSecret("AWS_SECRET_ACCESS_KEY");

const AWS_REGION = "us-east-2";
const AWS_BUCKET_NAME = "captivate-media-hub";

function sanitizeFilename(filename = "upload") {
  return filename
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");
}

function buildS3Key(filename) {
  const safeName = sanitizeFilename(filename);
  const uniqueId = crypto.randomUUID();
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `uploads/${year}/${month}/${uniqueId}-${safeName}`;
}

exports.presignUpload = onRequest(
  {
    region: "us-central1",
    cors: true,
    secrets: [awsAccessKeyId, awsSecretAccessKey],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { filename, contentType } = req.body || {};

      if (!filename || !contentType) {
        res.status(400).json({ error: "filename and contentType are required" });
        return;
      }

      if (!contentType.startsWith("image/")) {
        res.status(400).json({ error: "Only image uploads are allowed" });
        return;
      }

      const s3Key = buildS3Key(filename);

      const s3 = new S3Client({
        region: AWS_REGION,
        credentials: {
          accessKeyId: awsAccessKeyId.value(),
          secretAccessKey: awsSecretAccessKey.value(),
        },
      });

      const command = new PutObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: s3Key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

      const publicUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`;

      res.status(200).json({
        uploadUrl,
        s3Key,
        publicUrl,
      });
    } catch (error) {
      logger.error("presignUpload error", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  }
);

exports.deleteMedia = onCall(
  {
    region: "us-central1",
    secrets: [awsAccessKeyId, awsSecretAccessKey],
  },
  async (request) => {
    // 🔐 Require login
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Login required.");
    }

    const { mediaId } = request.data || {};

    if (!mediaId) {
      throw new HttpsError("invalid-argument", "Missing mediaId.");
    }

    try {
      const ref = db.collection("media").doc(mediaId);
      const snap = await ref.get();

      if (!snap.exists) {
        throw new HttpsError("not-found", "Image not found.");
      }

      const data = snap.data();

      // Collect S3 keys (matches your structure)
      const keys = [
        data.s3Key,
        data.thumbnailKey,
        data.webKey,
        data.originalKey,
      ].filter(Boolean);

      if (keys.length === 0) {
        throw new HttpsError("failed-precondition", "No S3 keys found.");
      }

      // Create S3 client (same pattern as your upload function)
      const s3 = new S3Client({
        region: AWS_REGION,
        credentials: {
          accessKeyId: awsAccessKeyId.value(),
          secretAccessKey: awsSecretAccessKey.value(),
        },
      });

      // 🪣 Delete all objects
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: AWS_BUCKET_NAME,
          Delete: {
            Objects: keys.map((Key) => ({ Key })),
          },
        })
      );

      // 🧹 Delete Firestore doc
      await ref.delete();

      return { success: true };
    } catch (error) {
      logger.error("deleteMedia error", error);
      throw new HttpsError("internal", "Failed to delete image.");
    }
  }
);