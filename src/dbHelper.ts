import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, orderBy, limit, setDoc, getDoc, increment } from "firebase/firestore";
import { db } from "./firebase";
import { Photo, Post } from "./types";

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || "a1433a6a0a1aca4c53f8a8951e0c1bb3";

// Seed data
export const DEFAULT_PHOTOS: Photo[] = [
  {
    title: "Curved Horizons",
    caption: "A minimalist architectural photograph of a curved white concrete structure against a clear cerulean sky, using strong shadow play and geometric precision.",
    category: "Architecture",
    location: "Varanasi, India",
    imageUrl: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?q=80&w=1200",
    createdAt: 1729728000000, // 24 Oct, 2024
    analyzedDescription: "This photograph masterfully depicts clean modernist arcs against a deep contrast sky. Solid geometric shadows partition the canvas, evoking visual tranquility."
  },
  {
    title: "Classic Aperture",
    caption: "A vintage mechanics appreciation series celebrating tactile knobs, sharp glass, and physical shutters from the golden era of film storytelling.",
    category: "Conceptual",
    location: "Kolkata, India",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200",
    createdAt: 1729555200000, // 22 Oct, 2024
    analyzedDescription: "A highly cinematic retro close-up study of mechanical camera contours, showing precision engraving and physical texture details."
  },
  {
    title: "The Solitary Oak",
    caption: "A majestic solitary tree standing on a misty rural visual corridor during dawn, representing the expansive silence of organic creation.",
    category: "Landscape",
    location: "Sikkim, India",
    imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200",
    createdAt: 1729382400000, // 20 Oct, 2024
    analyzedDescription: "Subtle radial light dispersion, misty low-lying ground fog, and geometric asymmetrical tree placement highlights deep atmospheric perspective."
  },
  {
    title: "Faces Of Banaras",
    caption: "An intimate low-key detailed study of an elderly scholar on a bench reading a Sanskrit text, emphasizing deep age lines and visual wisdom.",
    category: "Portrait",
    location: "Banaras, India",
    imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1200",
    createdAt: 1728950400000, // 15 Oct, 2024
    analyzedDescription: "Highly emotional, intense key-light on human expression. Features textured skin surface patterns contrasted with severe charcoal backup shadow plane."
  }
];

export const DEFAULT_POSTS: Post[] = [
  {
    title: "When Light Finds the Structure",
    content: `I used to think architectural photography was mostly about finding the right building. I was wrong. The real work begins after the building has stopped being impressive.

A wall becomes a plane. A staircase becomes a line. A window becomes a small decision about where the day is allowed to enter. Once I stop trying to photograph the whole structure, I start noticing the quieter conversation between light and material.

### I begin with the shadow

The shadow is usually the first honest thing in the frame. It tells me where the sun is, how the surface turns, and whether the geometry is actually doing any work. When I walk around a building, I am not looking for a landmark image. I am waiting for one patch of darkness to make the rest of the composition feel necessary.

There is a particular pleasure in photographing concrete because it refuses to flatter itself. It holds dust, stains, seams, and the faint evidence of use. The camera does not need to beautify it. It only needs to stay patient long enough for its character to appear.

### What the frame leaves out

A good architectural photograph is not a survey. It is an edit. I leave out the traffic, the unfinished edges, the noise of the street, and sometimes even the most recognisable part of the building. What remains is not always a complete explanation, but it can be a complete feeling: weight, pause, heat, distance.

Negative space is not empty space. It is the room the photograph gives the viewer to think. The wider that room becomes, the more carefully every remaining line has to behave.

### A slower way to look

I now try to make fewer photographs when I am walking through a city. I watch a surface change as the clouds move. I return to the same corner after ten minutes. I let the first obvious image pass. Often, the second or third way of seeing is the one that feels like my own.

Architecture teaches me that clarity is rarely loud. It is built from proportion, restraint, and the courage to leave one thing unfilled.`,
    category: "Field Notes / Architecture",
    coverImage: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?q=80&w=1400",
    createdAt: Date.UTC(2026, 5, 18),
    tags: ["architecture", "light", "shadow", "negative space", "visual rhythm"]
  },
  {
    title: "The Discipline of Waiting",
    content: `Landscape photography has taught me that looking is not the same as seeing. Looking is immediate: a mountain appears, mist rolls over a field, a tree stands alone against the morning. Seeing asks for more time.

The photograph I want is usually hidden inside the first impression. I have to wait for the wind to settle, for the light to lose its drama, or for the scene to become ordinary again. That is often when its shape becomes clear.

### The landscape does not perform

I used to arrive with a picture already in mind. A lone tree, a bright horizon, a perfect layer of fog. When the landscape refused to give me that picture, I thought the morning had failed. Slowly, I learned that the failure was mine. I had brought a conclusion instead of a question.

A field does not need to look extraordinary to hold attention. A soft change in colour, a path disappearing behind grass, or the distance between two trees can be enough. The quieter the scene, the more carefully I have to listen to its proportions.

### Mist as a kind of editing

Mist removes information without making the image feel incomplete. It pushes the background away, softens the edge of a hill, and asks the eye to accept uncertainty. I like that. A photograph does not always need to explain where it was taken. Sometimes it only needs to preserve what it felt like to stand there before the day became busy.

In those moments, the camera becomes less like a machine for collecting proof and more like a small instrument for remembering attention.

### Taking the long way home

The best part of a landscape walk is often the return. The light has changed, the subject has lost its first impression, and I notice the things I ignored on the way in: a fence leaning into the road, a small bird crossing a pale sky, the colour of the soil after rain.

I am trying to photograph with that second look. Not the landscape as spectacle, but the landscape as company. The frame becomes a way of saying: I was here, I slowed down, and for a few minutes I noticed what was already enough.`,
    category: "Field Notes / Landscape",
    coverImage: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1400",
    createdAt: Date.UTC(2026, 4, 2),
    tags: ["landscape", "mist", "patience", "solitude", "observation"]
  }
];

// Database Functions
export async function getPhotosFromDB(): Promise<Photo[]> {
  try {
    const q = query(collection(db, "photos"));
    const snapshot = await getDocs(q);
    const photos: Photo[] = [];
    snapshot.forEach((docSnap) => {
      photos.push({ id: docSnap.id, ...docSnap.data() } as Photo);
    });
    
    if (photos.length === 0) {
      // DB is empty — return static defaults without writing (admin uploads via console)
      return DEFAULT_PHOTOS.map((p, index) => ({ ...p, position: index }));
    }

    // Sort by position ascending, fallback to createdAt descending if position undefined
    photos.sort((a, b) => {
      const posA = a.position !== undefined ? a.position : Number.MAX_SAFE_INTEGER;
      const posB = b.position !== undefined ? b.position : Number.MAX_SAFE_INTEGER;
      if (posA !== posB) return posA - posB;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    return photos;
  } catch (error) {
    console.warn("DB offline or error during photos load, using default assets:", error);
    return DEFAULT_PHOTOS;
  }
}

export async function getPostsFromDB(): Promise<Post[]> {
  try {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const posts: Post[] = [];
    snapshot.forEach((docSnap) => {
      posts.push({ id: docSnap.id, ...docSnap.data() } as Post);
    });

    if (posts.length === 0) {
      // DB is empty — return static defaults without writing (admin publishes via console)
      return DEFAULT_POSTS;
    }
    return posts;
  } catch (error) {
    console.warn("DB offline or error during posts load, using default articles:", error);
    return DEFAULT_POSTS;
  }
}

function isValidImageUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.startsWith("data:image")) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const MAX_IMAGE_URL_LENGTH = 1000;

function validatePhotoPayload(photo: Omit<Photo, "id">) {
  if (!isValidImageUrl(photo.imageUrl) || photo.imageUrl.length > MAX_IMAGE_URL_LENGTH) {
    throw new Error("Invalid photo.imageUrl: only HTTP(S) URLs are allowed.");
  }

  if (photo.imageUrls && !Array.isArray(photo.imageUrls)) {
    throw new Error("Invalid photo.imageUrls: must be an array of URLs.");
  }

  if (photo.imageUrls && photo.imageUrls.some((url) => !isValidImageUrl(url) || url.length > MAX_IMAGE_URL_LENGTH)) {
    throw new Error("Invalid photo.imageUrls: all entries must be HTTP(S) URLs.");
  }
}

function validatePhotoUpdatePayload(photo: Partial<Photo>) {
  if (photo.imageUrl !== undefined && !isValidImageUrl(photo.imageUrl)) {
    throw new Error("Invalid photo.imageUrl: only HTTP(S) URLs are allowed.");
  }

  if (photo.imageUrls !== undefined) {
    if (!Array.isArray(photo.imageUrls)) {
      throw new Error("Invalid photo.imageUrls: must be an array of URLs.");
    }
    if (photo.imageUrls.some((url) => !isValidImageUrl(url))) {
      throw new Error("Invalid photo.imageUrls: all entries must be HTTP(S) URLs.");
    }
  }
}

export async function addPhotoToDB(photo: Omit<Photo, "id">): Promise<void> {
  validatePhotoPayload(photo);
  await addDoc(collection(db, "photos"), photo);
}

export async function addPostToDB(post: Omit<Post, "id">): Promise<void> {
  await addDoc(collection(db, "posts"), post);
}

export async function uploadBase64Image(base64Data: string): Promise<string> {
  if (!base64Data.startsWith("data:image")) {
    return base64Data;
  }

  const cleanBase64 = base64Data.split(",")[1] || base64Data;
  const formData = new FormData();
  formData.append("image", cleanBase64);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  if (!result.success || !result.data?.url) {
    throw new Error(result.error?.message || "ImgBB upload failed");
  }

  const newUrl = result.data.url as string;
  if (!newUrl || !newUrl.startsWith("http")) {
    throw new Error("ImgBB upload did not return a valid image URL");
  }

  return newUrl;
}

export async function uploadImagesToImgBB(images: string[]): Promise<string[]> {
  const uploads = images.map((image) => uploadBase64Image(image));
  const results = await Promise.all(uploads);
  const invalid = results.filter((result) => typeof result !== "string" || result.startsWith("data:image"));
  if (invalid.length) {
    throw new Error("One or more ImgBB uploads returned invalid image values.");
  }
  return results;
}

export async function deletePhotoFromDB(id: string): Promise<void> {
  await deleteDoc(doc(db, "photos", id));
}

export async function deletePostFromDB(id: string): Promise<void> {
  await deleteDoc(doc(db, "posts", id));
}

export async function updatePhotoInDB(id: string, photo: Partial<Photo>): Promise<void> {
  validatePhotoUpdatePayload(photo);
  await updateDoc(doc(db, "photos", id), photo);
}

export async function savePhotoOrderInDB(photoOrders: { id: string; position: number }[]): Promise<void> {
  const promises = photoOrders.map((item) => {
    return updateDoc(doc(db, "photos", item.id), { position: item.position });
  });
  await Promise.all(promises);
}

export async function updatePostInDB(id: string, post: Partial<Post>): Promise<void> {
  await updateDoc(doc(db, "posts", id), post);
}

export interface AppInsights {
  retinalEncounters: number;
  portfolioViews: number;
  storyViews: number;
  aboutViews: number;
  adminViews: number;
}

export async function getRealInsights(): Promise<AppInsights> {
  try {
    const docRef = doc(db, "insights", "aggregate");
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      const initialData: AppInsights = {
        retinalEncounters: 45182,
        portfolioViews: 24510,
        storyViews: 15284,
        aboutViews: 5388,
        adminViews: 120,
      };
      await setDoc(docRef, initialData);
      return initialData;
    }
    const data = docSnap.data();
    return {
      retinalEncounters: data.retinalEncounters ?? 45182,
      portfolioViews: data.portfolioViews ?? 24510,
      storyViews: data.storyViews ?? 15284,
      aboutViews: data.aboutViews ?? 5388,
      adminViews: data.adminViews ?? 120,
    };
  } catch (error) {
    console.warn("Unable to fetch insights from database, reverting to fallback:", error);
    return {
      retinalEncounters: 45182,
      portfolioViews: 24510,
      storyViews: 15284,
      aboutViews: 5388,
      adminViews: 120,
    };
  }
}

export async function incrementPhotoViews(photoId: string): Promise<void> {
  try {
    const docRef = doc(db, "insights", "photo_counts");
    await setDoc(docRef, { [photoId]: increment(1) }, { merge: true });
  } catch {
    // silently fail — view tracking is non-critical
  }
}

export async function getPhotoViewCounts(): Promise<Record<string, number>> {
  try {
    const docRef = doc(db, "insights", "photo_counts");
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return {};
    return docSnap.data() as Record<string, number>;
  } catch {
    return {};
  }
}

export async function trackInsightEncounter(metric: keyof AppInsights): Promise<void> {
  try {
    const docRef = doc(db, "insights", "aggregate");
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await getRealInsights();
    }
    await updateDoc(docRef, {
      [metric]: increment(1),
      retinalEncounters: increment(1)
    });
  } catch (error) {
    console.warn("Telemetry offline:", error);
  }
}

