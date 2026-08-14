#!/usr/bin/env bash
# GROUP: fast
# Belge satır tavanları — tek otorite (FAZ-0.C.9).
# Gerekçe: agent'ın her turda okuduğu dosyalar şişerse bağlam yanar ve kimse okumaz.
# Şişen bir CLAUDE.md, olmayan bir CLAUDE.md'den kötüdür: okunmadığı hâlde okunmuş sayılır.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit 1

# dosya:tavan
LIMITS="
CLAUDE.md:200
KURALLAR.md:400
KARARLAR.md:600
DURUM.md:120
docs/ANAYASA.md:1200
docs/LOOP.md:300
"

fail=0
while IFS=: read -r f limit; do
  [ -z "$f" ] && continue
  [ -f "$f" ] || continue
  n=$(wc -l < "$f" | tr -d ' ')
  if [ "$n" -gt "$limit" ]; then
    echo "$f: $n satır, tavan $limit"
    fail=1
  fi
done <<< "$LIMITS"

# Faz dosyaları ve yol-kapsamlı kurallar
for f in docs/fazlar/FAZ-*.md; do
  [ -f "$f" ] || continue
  n=$(wc -l < "$f" | tr -d ' ')
  [ "$n" -le 250 ] || { echo "$f: $n satır, tavan 250"; fail=1; }
done
for f in .claude/rules/*.md; do
  [ -f "$f" ] || continue
  n=$(wc -l < "$f" | tr -d ' ')
  [ "$n" -le 120 ] || { echo "$f: $n satır, tavan 120"; fail=1; }
done

exit $fail
