import express, { Request, Response } from "express";
import path from "path";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

type Exhibit = {
  id: number;
  title: string;
  category: string;
  era: string;
  location: string;
  description: string;
  image: string;
  featured?: boolean;
};

const exhibits: Exhibit[] = [
  {
    id: 1,
    title: "The Golden Pharaoh",
    category: "Ancient Egypt",
    era: "c. 1323 BCE",
    location: "Gallery 01 · Ancient Civilizations",
    description: "Explore the artistry and symbolism of ancient Egyptian royal treasures. This exhibit introduces visitors to the craftsmanship, beliefs, and rituals that shaped one of history's most fascinating civilizations.",
    image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1200&q=85",
    featured: true
  },
  {
    id: 2,
    title: "Classical Marble Sculpture",
    category: "Sculpture",
    era: "5th century BCE",
    location: "Gallery 02 · Classical Worlds",
    description: "Discover how classical sculptors studied movement, proportion, and expression to create enduring works that continue to influence art today.",
    image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=85",
    featured: true
  },
  {
    id: 3,
    title: "The Painted Renaissance",
    category: "Painting",
    era: "15th–16th century",
    location: "Gallery 03 · European Art",
    description: "Step into a period of artistic innovation, where perspective, light, and human emotion transformed the visual arts.",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=85",
    featured: true
  },
  {
    id: 4,
    title: "Ceramics of the Silk Road",
    category: "Archaeology",
    era: "8th–14th century",
    location: "Gallery 04 · Trade & Exchange",
    description: "Trace the journeys of ceramic objects and the ideas, techniques, and traditions exchanged across historic trade routes.",
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=85"
  },
  {
    id: 5,
    title: "Stories in Bronze",
    category: "Sculpture",
    era: "12th century",
    location: "Gallery 05 · Metalwork",
    description: "Learn how artisans shaped bronze into objects of ceremony, devotion, and everyday life using remarkable technical skill.",
    image: "https://images.unsplash.com/photo-1577083288073-40892c0860a4?auto=format&fit=crop&w=1200&q=85"
  },
  {
    id: 6,
    title: "The Natural History Cabinet",
    category: "Natural History",
    era: "19th century collection",
    location: "Gallery 06 · Nature & Discovery",
    description: "A cabinet-inspired journey through natural specimens and the history of observation, classification, and scientific curiosity.",
    image: "https://images.unsplash.com/photo-1535338454770-8be927b5a00b?auto=format&fit=crop&w=1200&q=85"
  }
];

app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Museum Guide API is running" });
});

app.get("/api/exhibits", (req: Request, res: Response) => {
  const search = String(req.query.search || "").trim().toLowerCase();
  const category = String(req.query.category || "").trim().toLowerCase();

  const results = exhibits.filter((item) => {
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search) ||
      item.era.toLowerCase().includes(search);
    const matchesCategory = !category || category === "all" || item.category.toLowerCase() === category;
    return matchesSearch && matchesCategory;
  });

  res.json(results);
});

app.get("/api/exhibits/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const exhibit = exhibits.find((item) => item.id === id);

  if (!exhibit) {
    res.status(404).json({ message: "Exhibit not found" });
    return;
  }

  res.json(exhibit);
});

app.get("*", (_req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Museum Guide is running at http://localhost:${PORT}`);
});
