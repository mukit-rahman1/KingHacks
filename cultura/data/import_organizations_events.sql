-- Replace 9024d080-fede-4523-ae08-701ee7254555 with an auth.users id

-- Upsert organizations + events from Organization_Event.xlsx

begin;

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'Skeleton Park Folk Knitters', 'skeleton-park-folk-knitters-b11a3a', 'Casual knitting circle that meets in the park.', $$["craft", "community", "outdoor"]$$::jsonb, $$[{"title": "Stitch & Bitch Tuesdays", "description": "Bring a project and chat.", "date": "07-14-2025", "tags": ["social", "craft"]}, {"title": "Beginner Hat Workshop", "description": "Learn to knit in the round.", "date": "09-11-2026", "tags": ["tutorial", "beginner"]}, {"title": "Yarn Bombing Prep", "description": "Prepare creations for a local tree.", "date": "03-08-2025", "tags": ["activist", "art"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'Kingston Tiny Book Club', 'kingston-tiny-book-club-2d142f', 'Reads only novellas and short stories.', $$["books", "social", "casual"]$$::jsonb, $$[{"title": "Coffee & Short Stories", "description": "Discuss this month's pick at a caf\u00e9.", "date": "11-30-2025", "tags": ["discussion", "coffee"]}, {"title": "Author Speculation Night", "description": "Guess who wrote anonymous stories.", "date": "05-22-2026", "tags": ["game", "fun"]}, {"title": "Micro-Fiction Swap", "description": "Write and share 100-word stories.", "date": "08-03-2025", "tags": ["writing", "creative"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'Limestone City Swing Dance', 'limestone-city-swing-dance-89f3bb', 'Weekly East Coast Swing lessons for beginners.', $$["dance", "social", "beginner"]$$::jsonb, $$[{"title": "Absolute Beginner Lesson", "description": "No partner needed.", "date": "12-25-2025", "tags": ["tutorial", "fun"]}, {"title": "Swing Social Dance", "description": "Practice moves to live music.", "date": "04-17-2026", "tags": ["music", "community"]}, {"title": "Vintage Hair Styling Workshop", "description": "Learn 1940s hairstyles.", "date": "01-19-2025", "tags": ["vintage", "craft"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'Kingston Community Seed Library', 'kingston-community-seed-library-972588', 'Borrow seeds, grow plants, return next year''s seeds.', $$["garden", "sustainability", "volunteer"]$$::jsonb, $$[{"title": "Seed Packing Party", "description": "Prepare seed packets for the season.", "date": "11-05-2026", "tags": ["volunteer", "prep"]}, {"title": "Heirloom Tomato Talk", "description": "Learn to save seeds.", "date": "10-12-2025", "tags": ["tutorial", "food"]}, {"title": "Seed Swap Saturday", "description": "Bring extra seeds to trade.", "date": "02-28-2026", "tags": ["community", "garden"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'Portsmouth Village Poetry Collective', 'portsmouth-village-poetry-collective-a4ffd4', 'Writes and shares poetry in a pub backroom.', $$["writing", "poetry", "social"]$$::jsonb, $$[{"title": "Prompt Night", "description": "Write from provided prompts.", "date": "06-01-2025", "tags": ["creative", "workshop"]}, {"title": "Open Mic Poetry", "description": "Share your work in a supportive space.", "date": "08-09-2026", "tags": ["performance", "community"]}, {"title": "Found Poetry Collage", "description": "Make poems from old magazines.", "date": "04-26-2025", "tags": ["craft", "fun"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'Rideau Trail Hiking Pals', 'rideau-trail-hiking-pals-d9f995', 'Organizes short, local hikes for all fitness levels.', $$["outdoor", "fitness", "social"]$$::jsonb, $$[{"title": "Lemoine Point Loop", "description": "Easy Sunday morning birdwatching hike.", "date": "01-01-2026", "tags": ["nature", "beginner"]}, {"title": "Rock Dunder Sunset Hike", "description": "Moderate hike for a stunning view.", "date": "09-07-2025", "tags": ["scenic", "moderate"]}, {"title": "Winter Solstice Snowshoe", "description": "Celebrate the shortest day.", "date": "07-30-2026", "tags": ["seasonal", "wellness"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'Kingston Board Game Designers', 'kingston-board-game-designers-652b52', 'Playtests and develops original board games.', $$["games", "design", "creative"]$$::jsonb, $$[{"title": "Prototype Playtest Night", "description": "Try out members' unfinished games.", "date": "02-14-2025", "tags": ["feedback", "fun"]}, {"title": "Mechanics Workshop", "description": "Focus on one game element like card drafting.", "date": "10-18-2026", "tags": ["design", "tutorial"]}, {"title": "Pizza & Publishing Talk", "description": "Discuss how to self-publish a game.", "date": "05-05-2025", "tags": ["business", "social"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'Wolfe Island Community Choir', 'wolfe-island-community-choir-820b7e', 'Non-audition choir for island residents.', $$["music", "community", "casual"]$$::jsonb, $$[{"title": "Weekly Rehearsal", "description": "Learn folk and pop songs.", "date": "03-19-2026", "tags": ["practice", "social"]}, {"title": "Ferry Terminal Caroling", "description": "Holiday singing for commuters.", "date": "12-07-2025", "tags": ["seasonal", "performance"]}, {"title": "Potluck & Sing-Along", "description": "Social event with group singing.", "date": "06-12-2026", "tags": ["food", "fun"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'Queen''s Campus Bee Club', 'queen-s-campus-bee-club-fa242f', 'Maintains campus bee hives and promotes pollinator health.', $$["environment", "education", "campus"]$$::jsonb, $$[{"title": "Hive Inspection Demo", "description": "See the bees up close (safely).", "date": "08-21-2025", "tags": ["tutorial", "nature"]}, {"title": "Beeswax Wrap Making", "description": "Craft sustainable food wraps.", "date": "12-31-2026", "tags": ["craft", "sustainability"]}, {"title": "Pollinator Garden Planting", "description": "Help plant native flowers.", "date": "01-31-2025", "tags": ["volunteer", "garden"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'Kingston Fermentation Friends', 'kingston-fermentation-friends-247b53', 'Shares knowledge on pickling, brewing, and fermenting.', $$["food", "diy", "workshop"]$$::jsonb, $$[{"title": "Sauerkraut Slam", "description": "Everyone makes their own jar to take home.", "date": "04-01-2026", "tags": ["tutorial", "hands-on"]}, {"title": "Kombucha SCOBY Swap", "description": "Trade starter cultures.", "date": "07-07-2025", "tags": ["community", "food"]}, {"title": "Hot Sauce Competition", "description": "Taste-test homemade ferments.", "date": "09-23-2026", "tags": ["social", "fun"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'The Screening Room Film Buffs', 'the-screening-room-film-buffs-70d1df', 'Meets after indie film screenings for discussion.', $$["film", "discussion", "arts"]$$::jsonb, $$[{"title": "Post-Film Debate", "description": "Discuss the week's featured movie.", "date": "03-17-2025", "tags": ["social", "critique"]}, {"title": "Local Filmmaker Spotlight", "description": "Q&A with a Kingston director.", "date": "11-15-2026", "tags": ["interview", "community"]}, {"title": "Short Film Marathon", "description": "Watch and rate submitted shorts.", "date": "10-31-2025", "tags": ["fun", "casual"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'Artillery Park AquaFit Crew', 'artillery-park-aquafit-crew-1c2ced', 'Morning aquafit group for seniors and beginners.', $$["fitness", "wellness", "senior"]$$::jsonb, $$[{"title": "Morning Water Workout", "description": "Low-impact pool exercise class.", "date": "02-14-2026", "tags": ["health", "social"]}, {"title": "Poolside Social Tea", "description": "Chat after the workout.", "date": "06-15-2025", "tags": ["community", "casual"]}, {"title": "Aquatic Safety Refresher", "description": "Review water safety skills.", "date": "08-25-2026", "tags": ["education", "wellness"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'Kingston Trash Cleanup Collective', 'kingston-trash-cleanup-collective-6ff984', 'Weekly litter pickup in different neighbourhoods.', $$["volunteer", "environment", "community"]$$::jsonb, $$[{"title": "Spring Parkway Cleanup", "description": "Clear winter debris from the K&P Trail.", "date": "04-10-2025", "tags": ["outdoor", "seasonal"]}, {"title": "Downtown Dash", "description": "Quick one-hour focused cleanup.", "date": "01-15-2026", "tags": ["fitness", "urban"]}, {"title": "Trash Art Sculpture", "description": "Build a sculpture from safe found litter.", "date": "09-29-2025", "tags": ["art", "awareness"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'Cookes-Portsmouth Ukulele Jam', 'cookes-portsmouth-ukulele-jam-e8c857', 'Casual strum-along group for all levels.', $$["music", "beginner", "social"]$$::jsonb, $$[{"title": "Chords 101 Workshop", "description": "Learn the basic four chords.", "date": "07-04-2026", "tags": ["tutorial", "beginner"]}, {"title": "Campfire Songs Jam", "description": "Strum familiar tunes together.", "date": "02-03-2025", "tags": ["fun", "community"]}, {"title": "Kids & Parents Ukulele Hour", "description": "Family-friendly musical fun.", "date": "10-08-2026", "tags": ["family", "casual"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'Kingston Student Dog-Walking Club', 'kingston-student-dog-walking-club-3a2d1a', 'Pairs students with local seniors needing dog-walking help.', $$["volunteer", "animals", "community"]$$::jsonb, $$[{"title": "New Volunteer Orientation", "description": "Learn safety and handling.", "date": "05-28-2025", "tags": ["training", "education"]}, {"title": "Puppy Playdate at City Park", "description": "Socialize dogs (and people).", "date": "03-03-2026", "tags": ["social", "animals"]}, {"title": "Dog First Aid Basics", "description": "Workshop with a local vet.", "date": "12-19-2025", "tags": ["workshop", "safety"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'Kingston Improv Drop-In', 'kingston-improv-drop-in-beecfc', 'Weekly drop-in improv comedy workshops.', $$["comedy", "theatre", "social"]$$::jsonb, $$[{"title": "\"Yes, And...\" Basics", "description": "Foundational improv skills workshop.", "date": "06-30-2026", "tags": ["beginner", "workshop"]}, {"title": "Character Creation Games", "description": "Focus on developing funny characters.", "date": "08-14-2025", "tags": ["creative", "fun"]}, {"title": "Open Jam Performance", "description": "Practice scenes for a small audience.", "date": "12-10-2026", "tags": ["performance", "casual"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'Kingston Repair Café Volunteers', 'kingston-repair-caf-volunteers-abc451', 'Fix broken items for free to reduce waste.', $$["repair", "sustainability", "volunteer"]$$::jsonb, $$[{"title": "Monthly Repair Caf\u00e9", "description": "Bring a broken item (toaster, clothing, bike).", "date": "01-05-2025", "tags": ["community", "diy"]}, {"title": "Sewing Machine Maintenance 101", "description": "Learn to service your machine.", "date": "04-30-2026", "tags": ["workshop", "craft"]}, {"title": "Tool Sharpening Day", "description": "Sharpen kitchen knives and garden tools.", "date": "07-22-2025", "tags": ["practical", "skill"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'Williamsville Community Garden Plotters', 'williamsville-community-garden-plotters-d2d363', 'Manages a small neighbourhood plot-sharing garden.', $$["garden", "food", "neighbourhood"]$$::jsonb, $$[{"title": "Spring Planting Day", "description": "Everyone helps plant the main beds.", "date": "09-05-2026", "tags": ["volunteer", "seasonal"]}, {"title": "Weeding & Meditation Wednesday", "description": "Mindful garden maintenance.", "date": "03-30-2025", "tags": ["wellness", "community"]}, {"title": "Harvest Potluck Dinner", "description": "Share a meal with garden produce.", "date": "11-28-2026", "tags": ["food", "social"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'Kingston Silent Book Club Chapter', 'kingston-silent-book-club-chapter-dd3346', 'Everyone brings a book and reads together in quiet camaraderie.', $$["books", "quiet", "social"]$$::jsonb, $$[{"title": "Cafe Read-In", "description": "Read silently, then chat optionally.", "date": "10-09-2025", "tags": ["coffee", "relaxing"]}, {"title": "Park Blanket Read-Along", "description": "Outdoor silent reading picnic.", "date": "02-07-2026", "tags": ["outdoor", "leisure"]}, {"title": "Book Haul Show & Tell", "description": "Show off recent book acquisitions.", "date": "06-24-2025", "tags": ["casual", "fun"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

insert into public.organizations (owner_id, name, slug, description, tags, events)
values ('9024d080-fede-4523-ae08-701ee7254555', 'Kingston Teen Mural Project', 'kingston-teen-mural-project-a61d1f', 'Teens design and paint murals with local artists.', $$["art", "youth", "community"]$$::jsonb, $$[{"title": "Brainstorming & Sketch Jam", "description": "Develop mural ideas.", "date": "08-18-2026", "tags": ["design", "creative"]}, {"title": "Spray Paint Safety Workshop", "description": "Learn safe graffiti techniques.", "date": "04-15-2025", "tags": ["tutorial", "skill"]}, {"title": "Community Paint Day", "description": "Public help painting the approved design.", "date": "01-22-2026", "tags": ["volunteer", "fun"]}]$$::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  tags = excluded.tags,
  events = excluded.events,
  updated_at = now();

commit;