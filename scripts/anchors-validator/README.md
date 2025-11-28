# Markdown Anchor Validator

This script checks **markdown files** for **broken header links (anchor links)** and suggests possible corrections.

## Purpose
[Issue](https://github.com/XTLS/Xray-docs-next/issues/765)

## Usage

Run the script with the path to the docs directory (defaults to `./docs`):

## Output Format

The script outputs broken anchor links along with suggested replacements in the following format:

```bash
File: <path_to_file>
#<broken_anchor> (<path_to_file>:<line_number>) → #<suggested_anchor> (<path_to_file>:<line_number>)
```
### How to read it

- **File:** the markdown file where the broken anchor was found.  
- **#<broken_anchor>:** the anchor in the markdown link that does not match any header.  
- **(<path_to_file>:<line_number>):** the location of the broken anchor in the file.  
- **→ #<suggested_anchor>:** the suggested correct anchor that likely matches the intended header.  
- **(<path_to_file>:<line_number>):** the location of the header that the suggestion points to.  

## Notes

Suggestions are based on:
1. Normalized matching (ignoring underscores)
2. Similarity (Levenshtein distance)
3. Nearby headers (proximity in the file)
