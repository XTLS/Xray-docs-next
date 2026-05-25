# Validate that all ```json code blocks contain valid JSONC (JSON with comments).
import json
import re
import sys
from pathlib import Path

CODEBLOCK_START = re.compile(r"^```json\w*")
CODEBLOCK_END = re.compile(r"^```\s*$")
VITEPRESS_ANNOTATION = re.compile(r"\[!code [^\]]*\]")


def strip_jsonc_comments(text: str) -> str:
    result = []
    for line in text.splitlines():
        stripped = line.lstrip()
        if stripped.startswith("//"):
            result.append("")
            continue
        if "//" in line:
            in_str = False
            escape = False
            cut = -1
            for i, ch in enumerate(line):
                if escape:
                    escape = False
                    continue
                if ch == "\\":
                    escape = True
                    continue
                if ch == '"':
                    in_str = not in_str
                if not in_str and line[i : i + 2] == "//":
                    cut = i
                    break
            if cut >= 0:
                line = line[:cut]
        result.append(line)
    return "\n".join(result)


def check_file(path: Path) -> list[str]:
    errors = []
    lines = path.read_text(encoding="utf-8").splitlines()
    block_start = -1

    for i, line in enumerate(lines):
        stripped = line.strip()
        if CODEBLOCK_START.match(stripped):
            block_start = i
            continue
        if CODEBLOCK_END.match(stripped) and block_start >= 0:
            block_lines = lines[block_start + 1 : i]
            block_lines = [
                VITEPRESS_ANNOTATION.sub("", l) for l in block_lines
            ]
            fragment = "\n".join(block_lines)
            cleaned = strip_jsonc_comments(fragment)
            try:
                json.loads(cleaned)
            except json.JSONDecodeError as e:
                rel = path.as_posix()
                errors.append(f"  {rel}:{block_start + 1}  {e}")
            block_start = -1

    return errors


def main() -> int:
    root = Path.cwd()
    all_errors: list[str] = []

    for md in sorted(root.rglob("*.md")):
        text = md.read_text(encoding="utf-8")
        if "```json" not in text:
            continue
        all_errors.extend(check_file(md))

    if all_errors:
        print(f"Found {len(all_errors)} invalid JSON block(s):\n")
        for e in all_errors:
            print(e)
        return 1

    print("All JSON blocks are valid JSONC.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
