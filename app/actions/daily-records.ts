"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function savePhoto(file: File, prefix: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!process.env.CLOUDINARY_CLOUD_NAME) return null;

  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "animal-care", public_id: `${prefix}-${Date.now()}` },
      (error, result) => {
        if (error) { console.error(error); resolve(null); }
        else resolve(result?.secure_url ?? null);
      }
    );
    stream.end(buffer);
  });
}

export async function createDailyRecord(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const stoolFile = formData.get("stoolPhoto") as File;
  const injuryFile = formData.get("injuryPhoto") as File;

  const stoolPhotoUrl = await savePhoto(stoolFile, "stool");
  const injuryPhotoUrl = await savePhoto(injuryFile, "injury");

  const animalId = formData.get("animalId") as string;

  await prisma.dailyRecord.create({
    data: {
      animalId,
      recordDate: new Date(formData.get("recordDate") as string),
      timeOfDay: (formData.get("timeOfDay") as string) || null,
      staffId: session.user.id!,
      energyLevel: formData.get("energyLevel") ? parseInt(formData.get("energyLevel") as string) : null,
      appetite: (formData.get("appetite") as string) || null,
      foodAmount: (formData.get("foodAmount") as string) || null,
      urineAmount: (formData.get("urineAmount") as string) || null,
      stoolCondition: (formData.get("stoolCondition") as string) || null,
      stoolPhotoUrl,
      brushing: formData.get("brushing") === "on",
      nailTrimming: formData.get("nailTrimming") === "on",
      trimming: formData.get("trimming") === "on",
      shampoo: formData.get("shampoo") === "on",
      inHeat: formData.get("inHeat") === "on",
      injury: (formData.get("injury") as string) || null,
      injuryPhotoUrl,
      notes: (formData.get("notes") as string) || null,
    },
  });

  revalidatePath("/daily-records");
  revalidatePath(`/animals/${animalId}`);
  redirect(`/daily-records?animalId=${animalId}`);
}

export async function updateDailyRecord(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await prisma.dailyRecord.findUnique({ where: { id } });
  if (!existing) throw new Error("Record not found");

  const stoolFile = formData.get("stoolPhoto") as File;
  const injuryFile = formData.get("injuryPhoto") as File;

  const stoolPhotoUrl = (await savePhoto(stoolFile, "stool")) ?? existing.stoolPhotoUrl;
  const injuryPhotoUrl = (await savePhoto(injuryFile, "injury")) ?? existing.injuryPhotoUrl;

  await prisma.dailyRecord.update({
    where: { id },
    data: {
      recordDate: new Date(formData.get("recordDate") as string),
      timeOfDay: (formData.get("timeOfDay") as string) || null,
      energyLevel: formData.get("energyLevel") ? parseInt(formData.get("energyLevel") as string) : null,
      appetite: (formData.get("appetite") as string) || null,
      foodAmount: (formData.get("foodAmount") as string) || null,
      urineAmount: (formData.get("urineAmount") as string) || null,
      stoolCondition: (formData.get("stoolCondition") as string) || null,
      stoolPhotoUrl,
      brushing: formData.get("brushing") === "on",
      nailTrimming: formData.get("nailTrimming") === "on",
      trimming: formData.get("trimming") === "on",
      shampoo: formData.get("shampoo") === "on",
      inHeat: formData.get("inHeat") === "on",
      injury: (formData.get("injury") as string) || null,
      injuryPhotoUrl,
      notes: (formData.get("notes") as string) || null,
    },
  });

  revalidatePath("/daily-records");
  redirect(`/daily-records?animalId=${existing.animalId}`);
}
