#!/usr/bin/env bash
# Export the transliteration corpora straight from the Açık Kuran database
# into the shape src/data/transliteration.ts expects.
#
# Two ways to run it:
#
#   A) Mac, repo checkout, database reachable from outside:
#        DB_URL="postgres://user:pass@host:5432/db" ./scripts/export-transliteration-from-db.sh
#
#   B) Server, database only reachable locally — copy this one file over:
#        scp scripts/export-transliteration-from-db.sh sunucu:~/
#        ssh sunucu 'bash ~/export-transliteration-from-db.sh ~/acikkuran-api/.env'
#        scp 'sunucu:~/translit-*.json' src/data/
#
# Connection settings are read from, in this order:
#   1. DB_URL or DATABASE_URL          — postgres://user:pass@host:port/db
#   2. DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME
#   3. an .env file passed as the first argument (same variable names)
#
# Schema (acik-kuran/acikkuran-api, routes/surahs.js):
#   acikkuran_verses(surah_id, verse_number, transcription, transcription_en, …)
# The table is auto-detected, so a different schema or name still works.
# Override with TABLE=schema.name if detection picks the wrong one.
#
# Output goes to src/data/ when run inside the repo, otherwise to $PWD.
# Override with OUT_DIR=/some/path.

set -euo pipefail

# ---------------------------------------------------------------- .env ------
# Parsed rather than sourced, and never overrides a variable already exported.
if [[ -n "${1:-}" ]]; then
    if [[ ! -f "$1" ]]; then
        echo ".env dosyası bulunamadı: $1" >&2
        exit 1
    fi
    while IFS= read -r line || [[ -n "$line" ]]; do
        line="${line#"${line%%[![:space:]]*}"}"   # strip leading whitespace
        case "$line" in
            ''|\#*) continue ;;
            *=*) ;;
            *) continue ;;
        esac
        line="${line#export }"
        key="$(printf '%s' "${line%%=*}" | tr -d '[:space:]')"
        value="${line#*=}"
        value="${value%\"}"; value="${value#\"}"
        value="${value%\'}"; value="${value#\'}"
        case "$key" in
            ''|*[!A-Za-z0-9_]*) continue ;;
        esac
        # printenv rather than ${!key}: same answer on macOS's bash 3.2
        if [[ -z "$(printenv "$key" 2>/dev/null || true)" ]]; then
            export "$key=$value"
        fi
    done < "$1"
fi

# ----------------------------------------------------------- connection -----
PSQL=(psql)
if [[ -n "${DB_URL:-}" ]]; then
    PSQL+=("$DB_URL")
elif [[ -n "${DATABASE_URL:-}" ]]; then
    PSQL+=("$DATABASE_URL")
elif [[ -n "${DB_HOST:-}" && -n "${DB_NAME:-}" ]]; then
    # Separate variables go through PG* rather than a URL, so a password with
    # @ / : / # in it does not have to be percent-encoded.
    export PGHOST="$DB_HOST"
    export PGPORT="${DB_PORT:-5432}"
    export PGUSER="${DB_USER:-postgres}"
    export PGPASSWORD="${DB_PASSWORD:-}"
    export PGDATABASE="$DB_NAME"
else
    cat >&2 <<'USAGE'
Bağlantı bilgisi yok.

  DB_URL="postgres://kullanici:parola@sunucu:5432/veritabani" ./scripts/export-transliteration-from-db.sh

ya da acikkuran-api'nin .env dosyasını ver:

  ./scripts/export-transliteration-from-db.sh ~/acikkuran-api/.env

(.env içinde DATABASE_URL veya DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME aranır.)
USAGE
    exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
    echo "psql bulunamadı." >&2
    echo "  macOS : brew install libpq && brew link --force libpq" >&2
    echo "  Debian: sudo apt-get install -y postgresql-client" >&2
    exit 1
fi

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -z "${OUT_DIR:-}" ]]; then
    if [[ -d "$HERE/../src/data" ]]; then
        OUT_DIR="$(cd "$HERE/../src/data" && pwd)"
    else
        OUT_DIR="$PWD"
    fi
fi

echo "Bağlanılıyor..."
if ! "${PSQL[@]}" -At -v ON_ERROR_STOP=1 -c 'SELECT 1' >/dev/null; then
    echo "Veritabanına bağlanılamadı — yukarıdaki psql hatasına bak." >&2
    echo "Sunucu dışarıya kapalıysa bu betiği sunucunun kendisinde çalıştır." >&2
    exit 1
fi

if [[ -z "${TABLE:-}" ]]; then
    TABLE="$("${PSQL[@]}" -At -v ON_ERROR_STOP=1 -c "
        SELECT quote_ident(table_schema) || '.' || quote_ident(table_name)
        FROM information_schema.columns
        WHERE column_name = 'transcription_en'
        ORDER BY (table_schema = 'public') DESC, table_name
        LIMIT 1;")"
fi
if [[ -z "$TABLE" ]]; then
    echo "transcription_en sütunu olan bir tablo bulunamadı." >&2
    echo "Tabloları görmek için: psql ... -c '\\dt *.*'" >&2
    echo "Doğru tabloyu biliyorsan: TABLE=sema.tablo ./scripts/export-transliteration-from-db.sh" >&2
    exit 1
fi
echo "Tablo   : $TABLE"
echo "Hedef   : $OUT_DIR"
echo

# ---------------------------------------------------------------- export ----
# Never truncate the committed file before the query is known good: write to a
# scratch file, validate, and only then move it into place.
export_column() {
    local column="$1" outfile="$2" tmp stats
    tmp="$(mktemp "${TMPDIR:-/tmp}/translit.XXXXXX")"
    trap 'rm -f "$tmp"' RETURN

    echo "→ $column → $(basename "$outfile")"

    if ! "${PSQL[@]}" -At -v ON_ERROR_STOP=1 -c "
        SELECT json_object_agg(surah_id, verses)
        FROM (
            SELECT surah_id,
                   json_object_agg(verse_number, $column) AS verses
            FROM $TABLE
            WHERE $column IS NOT NULL AND btrim($column) <> ''
            GROUP BY surah_id
        ) grouped;
    " > "$tmp"; then
        echo "  psql sorgusu başarısız oldu — $(basename "$outfile") değiştirilmedi." >&2
        return 1
    fi

    if [[ ! -s "$tmp" ]] || [[ "$(head -c 1 "$tmp")" != "{" ]]; then
        echo "  Sorgu boş ya da JSON olmayan çıktı verdi — $(basename "$outfile") değiştirilmedi." >&2
        echo "  İlk 200 bayt: $(head -c 200 "$tmp")" >&2
        return 1
    fi

    stats="$("${PSQL[@]}" -At -v ON_ERROR_STOP=1 -c "
        SELECT count(DISTINCT surah_id) || ' sure, ' || count(*) || ' ayet'
        FROM $TABLE
        WHERE $column IS NOT NULL AND btrim($column) <> '';")"
    if [[ "$stats" == "114 sure, 6236 ayet" ]]; then
        echo "  $stats ✓  ($(wc -c < "$tmp" | tr -d ' ') bayt)"
    else
        echo "  $stats  ← beklenen 114 sure, 6236 ayet  ($(wc -c < "$tmp" | tr -d ' ') bayt)"
    fi

    mv "$tmp" "$outfile"
}

export_column transcription    "$OUT_DIR/translit-tr.json"
export_column transcription_en "$OUT_DIR/translit-en.json"

echo
if [[ -d "$HERE/../src" ]]; then
    echo "Sonraki adım:"
    echo "  npm run test:run"
    echo "  git add src/data/translit-tr.json src/data/translit-en.json"
    echo "  git commit -m 'data: Açık Kuran okunuş korpusu' && git push"
else
    echo "Dosyalar hazır. Şimdi Mac'e çek:"
    echo "  scp '$(hostname):$OUT_DIR/translit-*.json' src/data/"
fi
