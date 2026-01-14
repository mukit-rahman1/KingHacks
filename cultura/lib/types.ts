export type Role = "guest" | "user" | "organizer"

export type Category = {
  id: string
  label: string
  title: string
  description: string
}

export type Organizer = {
  id: string
  name: string
  mission: string
  type: "Student Club" | "Community Group" | "Nonprofit" | "Local Business"
  communities: string[]
  links: { label: string; href: string }[]
}

export type Event = {
  id: string
  title: string
  description: string
  dateISO: string
  dateHuman: string
  timeHuman: string
  location: string
  tags: string[]
  categoryId: string
  organizerId: string
  organizerName: string
}
