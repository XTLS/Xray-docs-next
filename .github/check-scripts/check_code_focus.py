# Validate that lines covered by // [!code focus:N] form valid JSONC when wrapped in {}.
import re
import sys
from pathlib import Path

FOCUS_RE = re.compile(r"//\s*\[!code focus:(\d+)\]")
CODEBLOCK_START = re.compile(r"^```json\w*")
CODEBLOCK_END = re.compile(r"^```\s*$")


def strip_jsonc_comments(text: str) -> str:
    result = []
    for line in text.splitlines():
        stripped = line.lstrip()
        if stripped.startswith("//"):
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


def validate_jsonc(fragment: str) -> str | None:
    import json

    cleaned = strip_jsonc_comments(fragment)
    wrapped = "{\n" + cleaned + "\n}"
    try:
        json.loads(wrapped)
        return None
    except json.JSONDecodeError as e:
        return str(e)


def check_file(path: Path) -> list[str]:
    errors = []
    lines = path.read_text(encoding="utf-8").splitlines()
    in_json_block = False

    for i, line in enumerate(lines):
        stripped = line.strip()
        if CODEBLOCK_START.match(stripped):
            in_json_block = True
            continue
        if CODEBLOCK_END.match(stripped):
            in_json_block = False
            continue
        if not in_json_block:
            continue

        m = FOCUS_RE.search(line)
        if not m:
            continue

        n = int(m.group(1))
        start = i + 1
        end = min(start + n, len(lines))
        fragment = "\n".join(lines[start:end])
        err = validate_jsonc(fragment)
        if err:
            rel = path.as_posix()
            errors.append(f"  {rel}:{i + 1}  focus:{n}  {err}")

    return errors


def main() -> int:
    docs_root = Path.cwd()
    all_errors: list[str] = []

    for md in sorted(docs_root.rglob("*.md")):
        text = md.read_text(encoding="utf-8")
        if "[!code focus:" not in text:
            continue
        errs = check_file(md)
        all_errors.extend(errs)

    if all_errors:
        print(f"Found {len(all_errors)} invalid focus block(s):\n")
        for e in all_errors:
            print(e)
        return 1

    print("All focus blocks are valid JSONC.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
