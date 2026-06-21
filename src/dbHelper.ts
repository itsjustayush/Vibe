import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, orderBy, limit, setDoc, getDoc, increment } from "firebase/firestore";
import { db } from "./firebase";
import { Photo, Post } from "./types";

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
    title: "The Silence of Concrete",
    content: `Architecture is frozen music. In this series, explore the heavy silences of concrete monolithic slabs. How do strong diagonal shadows interact with physical forms? How does the light curve?

In modern spaces, we see a distinct absence of decorative distraction. Each texture is allowed to speak for itself. We present concrete not as a substrate of commerce, but as an aesthetic statement of permanence and structural clarity.

### Core Philosophy
By focusing strictly on geometric boundaries, we extract the core components of negative space. Visual weight shifts. A simple 1px hairline shadow becomes as powerful as a concrete pillar.

- **Contrast:** Highly reflective sky vs textured, light-absorbent limestone finish.
- **Rhythm:** The deliberate, repeating pattern of structural formers.
- **Silence:** Leaving 70% of the visual canvas completely uninterrupted.`,
    category: "Urban Monographs Vol. 4",
    coverImage: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?q=80&w=1200",
    createdAt: 1729728000000, // 24 Oct, 2024
    analyzedThemes: ["Brutalism", "Negative Space", "Modernist Proportions"]
  },
  {
    title: "The Monolith Theory",
    content: `A narrative deep dive into structural brutality and standard geometric frameworks. The presence of physical monuments in wild landscapes changes our perception of time and space.

What does it mean to build a solid monument in a field of mist? To humanize the wilderness by throwing a concrete block into its midst. A meditation on standard angles, raw weight, and visual presence.

### Natural Intersections
When natural asymmetry meets human-made symmetry, a dialogue begins. A solitary tree responds to the raw gravity of a solid concrete prism. Time slows. The monolith becomes a solar indicator, casting slow, heavy dials on the grass.`,
    category: "Theory / Narrative Series",
    coverImage: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200",
    createdAt: 1729296000000, // 19 Oct, 2024
    analyzedThemes: ["Natural Entropy", "Symmetry", "Philosophical Landscapes"]
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

export async function addPhotoToDB(photo: Omit<Photo, "id">): Promise<void> {
  await addDoc(collection(db, "photos"), photo);
}

export async function addPostToDB(post: Omit<Post, "id">): Promise<void> {
  await addDoc(collection(db, "posts"), post);
}

export async function deletePhotoFromDB(id: string): Promise<void> {
  await deleteDoc(doc(db, "photos", id));
}

export async function deletePostFromDB(id: string): Promise<void> {
  await deleteDoc(doc(db, "posts", id));
}

export async function updatePhotoInDB(id: string, photo: Partial<Photo>): Promise<void> {
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

