from __future__ import annotations

import os
import hashlib
import re
from pathlib import Path
from typing import Any

import openpyxl
import requests


def normalize_cell(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def slugify(value: str) -> str:
  slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
  return slug or "org"


def parse_sheet(path: Path):
    workbook = openpyxl.load_workbook(path, read_only=True)
    sheet = workbook.active

    rows = list(sheet.iter_rows(values_only=True))
    if len(rows) < 2:
        raise ValueError("Worksheet is missing header rows.")

    header = [normalize_cell(value).lower() for value in rows[1]]
    column_map: dict[str, list[int]] = {}
    for idx, name in enumerate(header):
        if not name:
            continue
        column_map.setdefault(name, []).append(idx)

    required = {
        "name": "Organization name",
        "description": "Organization description",
        "tags": "Organization tags",
        "title": "Event title",
        "date": "Event date",
    }

    for column in required:
        if column not in column_map:
            raise ValueError(f"Missing required column: {required[column]}")

    name_idx = column_map["name"][0]
    org_desc_idx = column_map["description"][0]
    org_tags_idx = column_map["tags"][0]
    event_title_idx = column_map["title"][0]
    event_desc_idx = (
        column_map["description"][1]
        if len(column_map["description"]) > 1
        else column_map["description"][0]
    )
    event_date_idx = column_map["date"][0]
    event_tags_idx = (
        column_map["tags"][1]
        if len(column_map["tags"]) > 1
        else column_map["tags"][0]
    )

    orgs = []
    current_org = None

    for row in rows[2:]:
        name = normalize_cell(row[name_idx])
        org_description = normalize_cell(row[org_desc_idx])
        org_tags = normalize_cell(row[org_tags_idx])
        event_title = normalize_cell(row[event_title_idx])
        event_description = normalize_cell(row[event_desc_idx])
        event_date = normalize_cell(row[event_date_idx])
        event_tags = normalize_cell(row[event_tags_idx])

        if name:
            current_org = {
                "name": name,
                "description": org_description,
                "tags": [
                    tag.strip()
                    for tag in org_tags.split(",")
                    if tag.strip()
                ],
                "events": [],
            }
            orgs.append(current_org)

        if current_org and event_title:
            current_org["events"].append(
                {
                    "title": event_title,
                    "description": event_description,
                    "date": event_date,
                    "tags": [
                        tag.strip()
                        for tag in event_tags.split(",")
                        if tag.strip()
                    ],
                }
            )

    return orgs


def build_payload(orgs, owner_id: str):
    payload = []
    for org in orgs:
        slug_base = slugify(org["name"])
        digest = hashlib.md5(org["name"].encode("utf-8")).hexdigest()[:6]
        slug = f"{slug_base}-{digest}"
        payload.append(
            {
                "owner_id": owner_id,
                "name": org["name"],
                "slug": slug,
                "description": org["description"],
                "tags": org["tags"],
                "events": org["events"],
            }
        )
    return payload


def chunked(items, size):
    for start in range(0, len(items), size):
        yield items[start : start + size]


def main() -> int:
    base_dir = Path(__file__).resolve().parents[1]
    input_path = Path(
        os.environ.get("IMPORT_XLSX_PATH", base_dir / "Organization_Event.xlsx")
    )

    supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get(
        "NEXT_PUBLIC_SUPABASE_URL"
    )
    service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    owner_id = os.environ.get("IMPORT_OWNER_ID")

    if not supabase_url:
        raise SystemExit("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL.")
    if not service_role_key:
        raise SystemExit("Missing SUPABASE_SERVICE_ROLE_KEY.")
    if not owner_id:
        raise SystemExit("Missing IMPORT_OWNER_ID (auth.users id).")
    if not input_path.exists():
        raise SystemExit(f"Missing XLSX at {input_path}")

    orgs = parse_sheet(input_path)
    payload = build_payload(orgs, owner_id)

    headers = {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation",
    }

    url = f"{supabase_url}/rest/v1/organizations?on_conflict=slug"
    inserted = 0

    for batch in chunked(payload, 50):
        response = requests.post(url, headers=headers, json=batch, timeout=30)
        if response.status_code >= 300:
            raise SystemExit(
                f"Insert failed ({response.status_code}): {response.text}"
            )
        inserted += len(batch)

    print(f"Upserted {inserted} organizations.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
