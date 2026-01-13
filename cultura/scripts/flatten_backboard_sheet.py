from __future__ import annotations

from pathlib import Path
from typing import Any

import openpyxl


def normalize_cell(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


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
                "tags": org_tags,
                "events": [],
            }
            orgs.append(current_org)

        if current_org and event_title:
            current_org["events"].append(
                {
                    "title": event_title,
                    "description": event_description,
                    "date": event_date,
                    "tags": event_tags,
                }
            )

    return orgs


def build_text(orgs) -> str:
    blocks = []
    for org in orgs:
        lines = [
            f"Organization: {org['name']}",
            f"Description: {org['description'] or 'N/A'}",
            f"Tags: {org['tags'] or 'N/A'}",
        ]

        if org["events"]:
            lines.append("Events:")
            for event in org["events"]:
                lines.append(
                    "- {title} | {date} | Tags: {tags} | {desc}".format(
                        title=event["title"],
                        date=event["date"] or "TBD",
                        tags=event["tags"] or "N/A",
                        desc=event["description"] or "No description.",
                    )
                )
        else:
            lines.append("Events: None listed.")

        blocks.append("\n".join(lines))

    return "\n\n".join(blocks)


def main() -> int:
    input_path = Path("cultura/Organization_Event.xlsx")
    output_path = Path("cultura/data/backboard_seed.txt")

    if not input_path.exists():
        raise SystemExit("Missing cultura/Organization_Event.xlsx")

    orgs = parse_sheet(input_path)
    output_path.write_text(build_text(orgs), encoding="utf-8")
    print(f"Wrote {output_path}")
    print(f"Organizations: {len(orgs)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
