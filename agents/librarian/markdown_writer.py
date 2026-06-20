"""
Agent 2 — Tarot Librarian: Markdown Writer
Assembles YAML frontmatter + rich Markdown body and writes /wiki/*.md files.
"""
from pathlib import Path

import yaml

from ..scraper.utils import make_filename


# ─── Frontmatter ──────────────────────────────────────────────────────────────

def build_frontmatter(data: dict) -> str:
    """Build the YAML frontmatter block for a card Markdown file.

    The frontmatter is the machine-readable metadata used by Cynthia (Agent 3)
    for RAG retrieval and by the Next.js front-end for card rendering.
    """
    fm: dict = {
        "id":               data["id"],
        "name":             data["name_en"],
        "name_zh":          data["name_zh"],
        "arcana":           data["arcana"],
        "suit":             data.get("suit"),
        "number":           data.get("number"),
        "keywords":         data.get("keywords", []),
        "upright_meanings": data.get("upright_meanings", []),
        "reversed_meanings":data.get("reversed_meanings", []),
        "local_image":      data.get("local_image_path", ""),
        "image_url":        data.get("image_url", ""),
        "source_url":       data.get("source_url", ""),
        "scraped_at":       data.get("scraped_at", ""),
    }

    # yaml.dump with allow_unicode so Chinese characters are not escaped
    yaml_str = yaml.dump(
        fm,
        allow_unicode=True,
        default_flow_style=False,
        sort_keys=False,
    )
    return f"---\n{yaml_str}---\n"


# ─── Body ─────────────────────────────────────────────────────────────────────

def build_markdown_body(data: dict) -> str:
    """Build the rich Markdown body section for a card.

    Uses both Chinese and English section headings so Cynthia can retrieve
    content regardless of query language.
    """
    lines: list[str] = []

    # Title
    arcana_label = {
        "major": "大塔羅 Major Arcana",
        "minor": "小塔羅 Minor Arcana",
        "court": "宮廷牌 Court Card",
    }.get(data["arcana"], data["arcana"])

    lines += [
        f"# {data['id']:02d} {data['name_zh']} / {data['name_en']}",
        "",
        f"**{arcana_label}**",
        "",
    ]

    # Keywords banner
    if data.get("keywords"):
        kw_str = "、".join(data["keywords"])
        lines += [f"> {kw_str}", ""]

    # 簡述 / Summary
    if data.get("summary"):
        lines += [
            "## 簡述 Summary",
            "",
            data["summary"],
            "",
        ]

    # 牌義故事 / Story & Symbolism
    if data.get("story"):
        lines += [
            "## 牌義故事 Story & Symbolism",
            "",
            data["story"],
            "",
        ]

    # 思考重點 / Reflection
    if data.get("reflection"):
        lines += ["## 思考重點 Reflection", ""]
        for point in data["reflection"]:
            lines.append(f"- {point}")
        lines.append("")

    # 正位 / Upright Meanings
    if data.get("upright_meanings"):
        lines += ["## 正位 Upright Meanings", ""]
        for meaning in data["upright_meanings"]:
            lines.append(f"- {meaning}")
        lines.append("")

    # 逆位 / Reversed Meanings
    if data.get("reversed_meanings"):
        lines += ["## 逆位 Reversed Meanings", ""]
        for meaning in data["reversed_meanings"]:
            lines.append(f"- {meaning}")
        lines.append("")

    # 感情 / Love
    if data.get("love_reading"):
        lines += [
            "## 感情關係 Love & Relationships",
            "",
            data["love_reading"],
            "",
        ]

    # 職場 / Career
    if data.get("career_reading"):
        lines += [
            "## 職場 Career & Work",
            "",
            data["career_reading"],
            "",
        ]

    return "\n".join(lines)


# ─── Writer ───────────────────────────────────────────────────────────────────

def write_markdown(data: dict, output_dir: Path) -> Path:
    """Assemble frontmatter + body and write the .md file to output_dir.

    Returns the Path of the written file.
    Filename format: {id:02d}-{slug}.md  (e.g. 00-fool.md, 21-world.md)
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    filename = make_filename(data["id"], data["slug"], ".md")
    dest = output_dir / filename

    content = build_frontmatter(data) + "\n" + build_markdown_body(data)
    dest.write_text(content, encoding="utf-8")
    return dest
