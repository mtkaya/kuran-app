#!/usr/bin/env bash
# Export the transliteration corpora straight from the Açık Kuran database
# into the shape src/data/transliteration.ts expects.
#
#   DB_URL="postgres://user:pass@host:port/db" ./scripts/export-transliteration-from-db.sh
#
# Use this instead of fetch-transliteration.mjs when you have database access —
# it is one round trip instead of 114, and it does not depend on the public API
# being up.
#
# Schema (from acik-kuran/acikkuran-api, routes/surahs.js):
#   acikkuran_verses(surah_id, verse_number, transcription, transcription_en, …)

set -euo pipefail

if [[ -z "${DB_URL:-}" ]]; then
    echo "DB_URL tanımlı değil." >&2
    echo 'Kullanım: DB_URL="postgres://..." ./scripts/export-transliteration-from-db.sh' >&2
    exit 1
fi

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="$HERE/../src/data"

export_column() {
    local column="$1" outfile="$2"
    echo "→ $column → $(basename "$outfile")"
    psql "$DB_URL" -At -c "
        SELECT json_object_agg(surah_id, verses)
        FROM (
            SELECT surah_id,
                   json_object_agg(verse_number, $column) AS verses
            FROM acikkuran_verses
            WHERE $column IS NOT NULL AND btrim($column) <> ''
            GROUP BY surah_id
        ) grouped;
    " > "$outfile"

    if [[ ! -s "$outfile" ]] || [[ "$(head -c 1 "$outfile")" != "{" ]]; then
        echo "  Boş veya geçersiz çıktı — sorguyu kontrol edin." >&2
        exit 1
    fi
}

export_column transcription    "$OUT_DIR/translit-tr.json"
export_column transcription_en "$OUT_DIR/translit-en.json"

echo
echo "Kapsam kontrolü:"
node -e "
for (const [name, file] of [['Türkçe','translit-tr.json'], ['Latin','translit-en.json']]) {
    const data = JSON.parse(require('fs').readFileSync('$OUT_DIR/' + file, 'utf8'));
    const surahs = Object.keys(data).length;
    const verses = Object.values(data).reduce((n, s) => n + Object.keys(s).length, 0);
    console.log(\`  \${name}: \${surahs} sure, \${verses} ayet\` + (surahs === 114 && verses === 6236 ? ' ✓' : '  ← beklenen 114 / 6236'));
}
"

echo
echo "Sonraki adım: npm run test:run && git add src/data/translit-*.json"
