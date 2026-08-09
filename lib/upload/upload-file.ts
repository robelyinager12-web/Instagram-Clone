export type UploadResult = {
  url: string;
  width: number;
  height: number;
  resourceType: "image" | "video";
};

export async function uploadFileToCloudinary(
  file: File,
  folder: string
): Promise<UploadResult> {
  const sigRes = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  if (!sigRes.ok) {
    const text = await sigRes.text().catch(() => "");
    throw new Error(`Could not get upload authorization: ${sigRes.status} ${text}`);
  }

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

  if (!uploadRes.ok) {
    const errorBody = await uploadRes.json().catch(() => null);
    const message = errorBody?.error?.message ?? `HTTP ${uploadRes.status}`;
    throw new Error(`Upload to Cloudinary failed: ${message}`);
  }

  const data = await uploadRes.json();
  return {
    url: data.secure_url,
    width: data.width,
    height: data.height,
    resourceType,
  };
}
