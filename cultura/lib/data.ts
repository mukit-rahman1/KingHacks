import { Category, Event, Organizer } from "@/lib/types"

export const categories: Category[] = [
  { id: "food", label: "Food", title: "Food & Potlucks", description: "Cook-offs, potlucks, tasting nights." },
  { id: "language", label: "Language", title: "Language Exchange", description: "Conversation tables and practice circles." },
  { id: "music", label: "Music", title: "Music & Dance", description: "Workshops, open mics, performances." },
  { id: "faith", label: "Faith", title: "Faith & Reflection", description: "Interfaith and reflection gatherings." },
  { id: "career", label: "Career", title: "Career & Networking", description: "Mentorship, resumes, newcomer support." },
  { id: "community", label: "Community", title: "Community & Volunteering", description: "Mutual aid, volunteering, city connection." }
]

export const categoriesById = Object.fromEntries(categories.map((c) => [c.id, c]))

export const organizers: Organizer[] = [
  {
    id: "org-asa",
    name: "Kingston Asian Student Alliance",
    mission: "Creating space to connect through culture, food, and community.",
    type: "Student Club",
    communities: ["East Asian", "Southeast Asian", "Allies"],
    links: [{ label: "Instagram", href: "https://example.com" }]
  },
  {
    id: "org-afro",
    name: "Afro-Caribbean Community Collective",
    mission: "Celebrating heritage through music, dance, and shared traditions.",
    type: "Community Group",
    communities: ["Black", "Afro-Caribbean", "Allies"],
    links: [{ label: "Website", href: "https://example.com" }]
  }
]

export const events: Event[] = [
  {
    id: "evt-1",
    title: "Lunar New Year Dumpling Night",
    description: "Short intro on traditions + dumpling folding station.",
    dateISO: "2026-01-18",
    dateHuman: "Jan 18, 2026",
    timeHuman: "6:00 PM",
    location: "ARC Hall, Kingston",
    tags: ["Potluck", "Hands-on", "Family-friendly"],
    categoryId: "food",
    organizerId: "org-asa",
    organizerName: "Kingston Asian Student Alliance"
  },
  {
    id: "evt-2",
    title: "Afrobeats Dance Workshop",
    description: "High energy, low pressure. Learn a short routine.",
    dateISO: "2026-01-24",
    dateHuman: "Jan 24, 2026",
    timeHuman: "7:00 PM",
    location: "Community Studio, Downtown",
    tags: ["Dance", "Beginner-friendly"],
    categoryId: "music",
    organizerId: "org-afro",
    organizerName: "Afro-Caribbean Community Collective"
  }
]
