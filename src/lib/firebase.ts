import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseConfig";
import axios from "axios";
import { Buffer } from "buffer";

interface DownloadResult {
  buffer: Buffer | null;
  file_name: string;
}

export async function uploadToFirebase(
  file: File
): Promise<{ file_key: string; file_name: string }> {
  const file_key = `uploads/${Date.now()}-${file.name.replace(" ", "-")}`;
  const storageRef = ref(storage, file_key);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return { file_key: downloadURL, file_name: file.name };
}

export async function downloadFromFirebase(
  fileKey: string
): Promise<DownloadResult> {
  try {
    const storageRef = ref(storage, fileKey);
    const url = await getDownloadURL(storageRef);
    const response = await axios.get(url, { responseType: "arraybuffer" });

    const file_name = `${Date.now().toString()}.pdf`;
    const buffer = Buffer.from(response.data, "binary");

    return { buffer, file_name };
  } catch (error) {
    console.error("Error downloading file from Firebase Storage", error);
    return { buffer: null, file_name: "" };
  }
}

export async function getFirebaseStorageUrl(fileKey: string): Promise<string> {
  try {
    const storageRef = ref(storage, fileKey);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error getting file URL from Firebase Storage", error);
    throw error;
  }
}
