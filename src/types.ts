export interface Photo {
  id?: string;
  title: string;
  caption: string;
  category: string;
  location: string;
  imageUrl: string;
  imageUrls?: string[];
  createdAt: number;
  analyzedDescription?: string;
  position?: number;
  tags?: string[];
}

export interface Post {
  id?: string;
  title: string;
  content: string;
  category: string; // Series or Collection Name
  coverImage: string;
  createdAt: number;
  analyzedThemes?: string[];
  tags?: string[];
}

export interface AdminStats {
  totalAssets: number;
  narrativeReach: string;
  storageUsed: number;
}
