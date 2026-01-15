"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { supabase } from "@/lib/supabase/client"

type Role = "guest" | "user" | "organizer"
type Profile = {
  username: string
  tags: string[]
  avatarUrl?: string
}

type OrgProfile = {
  id: string
  name: string
  tags: string[]
  events?: {
    id: string
    title?: string
    description?: string
  }[]
}

export default function Navbar({
  role = "guest",
  userName,
}: {
  role?: Role
  userName?: string
}) {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [sessionRole, setSessionRole] = useState<Role>("guest")
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orgProfile, setOrgProfile] = useState<OrgProfile | null>(null)
  const [usernameInput, setUsernameInput] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileNotice, setProfileNotice] = useState<string | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const navLinks = [
    { href: "/discover", label: "Discover" },
    { href: "/categories", label: "Categories" },
    { href: "/organizers", label: "Organizers" },
    { href: "/chat", label: "Chat" },
  ]

  const displayRole =
    hasSession && sessionRole === "guest" ? "user" : sessionRole === "guest" ? role : sessionRole
  const displayName = profile?.username ?? userName

  const orgEvents = useMemo(() => {
    return Array.isArray(orgProfile?.events) ? orgProfile?.events ?? [] : []
  }, [orgProfile])

  // Lock scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    if (!profileOpen) return
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [profileOpen])


  // Escape to close
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.auth.getSession()
      const accessToken = data.session?.access_token
      if (!accessToken) {
        setHasSession(false)
        setSessionRole("guest")
        setProfile(null)
        setOrgProfile(null)
        return
      }
      setHasSession(true)

      const profileResponse = await fetch("/api/individuals", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (profileResponse.ok) {
        const payload = (await profileResponse.json()) as {
          profile: Profile | null
        }
        if (payload.profile) {
          setProfile(payload.profile)
          setUsernameInput(payload.profile.username)
          setTagsInput(payload.profile.tags.join(", "))
          setAvatarUrl(payload.profile.avatarUrl ?? "")
          setSessionRole("user")
        }
      }

      const orgResponse = await fetch("/api/organizations", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (orgResponse.ok) {
        const payload = (await orgResponse.json()) as {
          organization: OrgProfile | null
        }
        if (payload.organization) {
          setOrgProfile(payload.organization)
          setSessionRole("organizer")
        }
      }
    }

    void loadProfile()
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      void loadProfile()
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleProfileSave = async () => {
    setProfileError(null)
    setProfileNotice(null)
    setIsSavingProfile(true)

    const { data } = await supabase.auth.getSession()
    const accessToken = data.session?.access_token
    if (!accessToken) {
      setProfileError("Please sign in again.")
      setIsSavingProfile(false)
      return
    }

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    const response = await fetch("/api/individuals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        username: usernameInput,
        tags,
        avatarUrl,
      }),
    })

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string }
      setProfileError(payload.error ?? "Unable to update profile.")
      setIsSavingProfile(false)
      return
    }

    setProfileNotice("Profile updated.")
    setProfile((prev) =>
      prev ? { ...prev, username: usernameInput, tags } : null
    )
    setIsSavingProfile(false)
  }

  const handleEventRemove = async (eventId: string) => {
    setProfileError(null)
    setProfileNotice(null)

    const { data } = await supabase.auth.getSession()
    const accessToken = data.session?.access_token
    if (!accessToken) {
      setProfileError("Please sign in again.")
      return
    }

    const response = await fetch("/api/events", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ eventId }),
    })

    if (!response.ok) {
      setProfileError("Unable to remove event.")
      return
    }

    setOrgProfile((prev) =>
      prev
        ? {
            ...prev,
            events: (prev.events ?? []).filter((event) => event.id !== eventId),
          }
        : prev
    )
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setProfileOpen(false)
  }

  const handleAvatarUpload = async () => {
    const file = avatarInputRef.current?.files?.[0]
    if (!file || isUploadingAvatar) {
      if (!file) {
        setProfileError("Select a file before uploading.")
      }
      return
    }

    setProfileError(null)
    setProfileNotice(null)
    setIsUploadingAvatar(true)

    const { data } = await supabase.auth.getSession()
    const accessToken = data.session?.access_token
    if (!accessToken) {
      setProfileError("Please sign in again.")
      setIsUploadingAvatar(false)
      return
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", "profile")

    const response = await fetch("/api/uploads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    })

    if (!response.ok) {
      setProfileError("Unable to upload photo.")
      setIsUploadingAvatar(false)
      return
    }

    const payload = (await response.json()) as { url?: string }
    if (payload.url) {
      setAvatarUrl(payload.url)
      setProfileNotice("Profile photo uploaded. Save profile to apply.")
    }

    if (avatarInputRef.current) {
      avatarInputRef.current.value = ""
    }
    setIsUploadingAvatar(false)
  }

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b border-border transition-colors duration-300",
        open
          ? "bg-background shadow-sm"
          : "bg-background/80 backdrop-blur",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" 
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="flex items-center gap-2">
          <div
            className="
              grid h-9 w-9 place-items-center rounded-xl
              bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)]
              shadow-sm
            "
          >
            <Image
              src="/images/calendar.png"
              alt="Cultura calendar logo"
              width={30}
              height={20}
              priority
            />
          </div>
          <span className="font-header text-lg font-bold text-foreground">
            Cultura
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          {displayRole === "guest" && (
            <>
              <Link
                href="/login"
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Sign in
              </Link>
            </>
          )}

          {displayRole !== "guest" && (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-card text-sm font-semibold text-foreground shadow-sm"
                aria-label="Open profile menu"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  displayName?.slice(0, 2).toUpperCase() ?? "ME"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Mobile button */}
        <button
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted md:hidden"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-drawer"
        >
          <div className="flex flex-col gap-1">
            <span className="h-0.5 w-5 bg-foreground" />
            <span className="h-0.5 w-5 bg-foreground" />
            <span className="h-0.5 w-5 bg-foreground" />
          </div>
        </button>
      </div>

      {/* ===== Mobile RIGHT drawer ===== */}
      {/* Overlay */}
      <div
        className={[
          "fixed inset-0 z-40 md:hidden",
          "transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        aria-hidden={!open}
      >
        <button
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        />
        <div
          className="
            absolute right-0 top-0 h-full w-[380px]
            bg-gradient-to-l from-[var(--brand-primary)]/15 via-transparent to-transparent
            pointer-events-none
          "
        />
      </div>

      {/* Drawer */}
      <aside
        id="mobile-drawer"
        className={[
          "fixed right-0 top-0 z-50 h-full w-[320px] md:hidden",
          "border-l border-border",
          "bg-background/95 backdrop-blur-xl shadow-2xl",
          "transform transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {/* Drawer header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <div
              className="
                grid h-8 w-8 place-items-center rounded-xl
                bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)]
                shadow-sm
              "
            >
              <Image
                src="/images/calendar.png"
                alt="Cultura logo"
                width={20}
                height={30}
              />
            </div>
            <span className="font-header text-lg font-bold text-foreground">
              Menu
            </span>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted"
            aria-label="Close menu"
          >
            Close
          </button>
        </div>

        {/* Drawer content */}
        <div className="flex h-[calc(100%-4rem)] flex-col px-4 py-4">
          {/* NAV SECTION (clean + aligned) */}
          <div className="rounded-2xl border border-border bg-card/60 p-2">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="
                  group flex w-full items-center justify-between
                  rounded-xl px-3 py-2.5
                  text-sm font-semibold text-foreground
                  transition-colors hover:bg-muted
                "
              >
                <span className="truncate">{item.label}</span>
                <span
                  className="
                    ml-3 inline-flex h-7 w-7 items-center justify-center
                    rounded-lg border border-border bg-background
                    text-muted-foreground
                    transition-transform group-hover:translate-x-0.5
                  "
                >
                  →
                </span>
              </Link>
            ))}
          </div>

          {/* ROLE ACTIONS SECTION */}
          <div className="mt-4 rounded-2xl border border-border bg-card/60 p-3">
            {role === "guest" && (
              <div className="space-y-2">
                
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl border border-border bg-brand-primary px-4 py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Sign in
                </Link>
                
              </div>
            )}

            {role === "user" && (
              <div className="space-y-2">
                <div className="rounded-xl border border-border bg-background px-4 py-3">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                    {userName ?? "User"}
                  </p>
                </div>

                <Link
                  href="/saved"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Saved
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl bg-secondary px-4 py-2.5 text-center text-sm font-semibold text-secondary-foreground hover:opacity-90"
                >
                  {userName ?? "Profile"}
                </Link>
              </div>
            )}

            {role === "organizer" && (
              <div className="space-y-2">
                <div className="rounded-xl border border-border bg-background px-4 py-3">
                  <p className="text-xs text-muted-foreground">Organizer</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                    {userName ?? "Org Account"}
                  </p>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/events/new"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  + Create Event
                </Link>
                <Link
                  href="/orgProfile"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl bg-secondary px-4 py-2.5 text-center text-sm font-semibold text-secondary-foreground hover:opacity-90"
                >
                  Org Profile
                </Link>
              </div>
            )}
          </div>

          {/* Bottom helper */}
          <div className="mt-auto pt-4">
            <div className="rounded-2xl border border-border bg-card/60 p-4">
              <p className="text-sm font-semibold text-foreground">Tip</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tap outside the drawer or press <span className="font-mono">Esc</span> to close.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {profileOpen && typeof document !== "undefined"
        ? createPortal(
            <>
              <div
                className="fixed inset-0 z-[100] bg-black/30"
                onClick={() => setProfileOpen(false)}
              />
              <aside
                className="fixed right-0 top-0 z-[110] h-full w-full max-w-sm border-l border-border bg-card p-5 shadow-2xl"
                style={{ width: "min(35vw, 360px)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        displayName?.slice(0, 2).toUpperCase() ?? "ME"
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">
                        Profile
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {displayName ?? "Community member"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfileOpen(false)}
                    className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  {orgProfile?.id ? (
                    <Link
                      href="/orgProfile"
                      onClick={() => setProfileOpen(false)}
                      className="block rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      Organization dashboard
                    </Link>
                  ) : null}
                  <div className="rounded-2xl border border-border bg-background p-3">
                    <p className="text-xs font-semibold text-foreground">
                      Profile photo
                    </p>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="mt-2 h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">
                        No photo yet.
                      </p>
                    )}
                    <div className="mt-3 flex flex-col gap-2">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="text-xs text-muted-foreground"
                      />
                      <button
                        type="button"
                        onClick={handleAvatarUpload}
                        disabled={isUploadingAvatar}
                        className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-60"
                      >
                        {isUploadingAvatar ? "Uploading..." : "Upload photo"}
                      </button>
                    </div>
                  </div>
                  <label className="block text-xs font-semibold text-foreground">
                    Username
                    <input
                      value={usernameInput}
                      onChange={(event) =>
                        setUsernameInput(event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="block text-xs font-semibold text-foreground">
                    Tags
                    <input
                      value={tagsInput}
                      onChange={(event) => setTagsInput(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      placeholder="running, dance, volunteering"
                    />
                  </label>

                  {profileError ? (
                    <p className="text-xs text-red-600">{profileError}</p>
                  ) : null}
                  {profileNotice ? (
                    <p className="text-xs text-emerald-600">
                      {profileNotice}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleProfileSave}
                    disabled={isSavingProfile}
                    className="w-full rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {isSavingProfile ? "Saving..." : "Save profile"}
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    Sign out
                  </button>
                </div>
              </aside>
            </>,
            document.body
          )
        : null}

    </header>
  )
}
