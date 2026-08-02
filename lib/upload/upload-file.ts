export type UploadResult = {
  url: string;
  width: number;
  height: number;
  resourceType: "image" | "video";
};

/**
 * 1. Ask our server for a signed upload (keeps the API secret server-side).
 * 2. POST the file straight to Cloudinary from the browser — the file
 *    bytes never round-trip through our own server.
 */
export async function uploadFileToCloudinary(
  file: File,
  folder: string
): Promise<UploadResult> {
  const sigRes = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  if (!sigRes.ok) throw new Error("Could not get upload authorization");

  const { timestamp, signature, apiKey, cloudName } = await sigRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const resourceType = file.type.startsWith("video") ? "video" : "image";

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );

  if (!uploadRes.ok) throw new Error("Upload to Cloudinary failed");

  const data = await uploadRes.json();
  return {
    url: data.secure_url,
    width: data.width,
    height: data.height,
    resourceType,
  };
}
