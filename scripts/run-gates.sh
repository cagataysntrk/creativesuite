#!/usr/bin/env bash
# Kapı koşucusu — just, git hook'ları ve zamanlanmış işler HEP bunu çağırır.
# Her kapı scripts/gates/<ad>.sh; ikinci satırında "# GROUP: fast" veya "# GROUP: all".
#   fast → commit öncesi, saniyeler
#   all  → push / faz kapanışı / haftalık
set -uo pipefail

# ⚠ LC_ALL=C ZORUNLU. `LANG=tr_TR.UTF-8` altında POSIX karakter sınıfları Türkçe
# collation'a göre çözülür ve `[A-Za-z]` aralığı `i`/`I` çevresinde KIRILIR:
#   $ LANG=tr_TR.UTF-8 grep -oE "[a-z.]+@[a-z.]+" <<< "ahmet.yilmaz@dokumsanayi.com.tr"
#   lmaz@dokumsanay          ← "yilmaz"ın başı ve "sanayi"nin sonu düştü
# Yani desen eşleşiyormuş gibi görünür ama YARIM eşleşir; kapı da yeşil raporlar.
# 2026-08-15'te bu, gerçek bir e-posta adresinin KVKK kapısından geçmesine yol açtı.
# Bu, `'i'.toUpperCase()` → `I` hatasının (R-21) kabuk seviyesindeki kardeşidir.
export LC_ALL=C

GROUP="${1:-fast}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GATES_DIR="$ROOT/scripts/gates"

[ -d "$GATES_DIR" ] || { echo "✗ $GATES_DIR yok"; exit 1; }

shopt -s nullglob
gates=("$GATES_DIR"/*.sh "$GATES_DIR"/*.mjs)
[ ${#gates[@]} -gt 0 ] || { echo "✗ hiç kapı yok — boş 'check' yasak (FAZ-0.A.4)"; exit 1; }

failed=0
ran=0
printf '── kapılar (%s) ──\n' "$GROUP"

for g in "${gates[@]}"; do
  name="$(basename "$g")"; name="${name%.sh}"; name="${name%.mjs}"
  gg="$(sed -n -e "s|^# GROUP: ||p" -e "s|^// GROUP: ||p" "$g" | head -1)"
  gg="${gg:-all}"
  if [ "$GROUP" != "all" ] && [ "$gg" != "$GROUP" ]; then
    continue
  fi
  ran=$((ran+1))
  runner=bash; [[ "$g" == *.mjs ]] && runner=node
  if out="$($runner "$g" 2>&1)"; then
    printf '  ✓ %s\n' "$name"
  else
    printf '  ✗ %s\n' "$name"
    printf '%s\n' "$out" | sed 's/^/      /'
    failed=$((failed+1))
  fi
done

[ "$ran" -gt 0 ] || { echo "✗ '$GROUP' grubunda çalışan kapı yok"; exit 1; }

if [ "$failed" -gt 0 ]; then
  printf '\n✗ %d/%d kapı kırmızı\n' "$failed" "$ran"
  exit 1
fi
printf '\n✓ %d kapı yeşil\n' "$ran"
