<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;

class DbInspectorController extends Controller
{
    private function ensureAllowed()
    {
        // Aman: hanya boleh jalan di local / development
        // Kalau mau fleksibel: ganti ke config('app.db_inspector_enabled')
        if (!App::environment(['local', 'development', 'testing'])) {
            abort(404);
        }
    }

    // GET /api/v1/admin/db/objects?include_views=1
    public function objects(Request $request)
    {
        $this->ensureAllowed();

        $includeViews = $request->boolean('include_views', true);
        $schema = 'public';

        // FIX pgsql: jangan pakai ANY(?) untuk binding array
        // pakai IN (...)
        $types = $includeViews ? ['BASE TABLE', 'VIEW'] : ['BASE TABLE'];
        $placeholders = implode(',', array_fill(0, count($types), '?'));

        $rows = DB::select(
            "SELECT table_name, table_type
             FROM information_schema.tables
             WHERE table_schema = ?
               AND table_type IN ($placeholders)
             ORDER BY table_name",
            array_merge([$schema], $types)
        );

        $data = collect($rows)->map(fn($r) => [
            'name' => $r->table_name,
            'type' => $r->table_type,              // BASE TABLE / VIEW
            'kind' => $r->table_type === 'VIEW' ? 'view' : 'table',
        ])->values();

        return response()->json(['data' => $data]);
    }

    // POST /api/v1/admin/db/inspect
    // body: { mode: "describe"|"create", objects: ["projects","skills"] }
    public function inspect(Request $request)
    {
        $this->ensureAllowed();

        $schema = 'public';

        $validated = $request->validate([
            'mode' => ['required', 'in:describe,create'],
            'objects' => ['required', 'array', 'min:1', 'max:50'], // batasi jumlah objek
            'objects.*' => ['string', 'max:190'],
        ]);

        $mode = $validated['mode'];
        $objects = array_values(array_unique(array_map('trim', $validated['objects'])));

        // Validasi ekstra: hanya huruf/angka/underscore (hindari injection aneh)
        $objects = array_values(array_filter($objects, fn($n) => preg_match('/^[a-zA-Z0-9_]+$/', $n)));

        // whitelist: hanya object yang benar-benar ada di schema public
        $existing = DB::select(
            "SELECT table_name, table_type
             FROM information_schema.tables
             WHERE table_schema = ?
             ORDER BY table_name",
            [$schema]
        );

        $map = [];
        foreach ($existing as $r) {
            $map[$r->table_name] = $r->table_type; // BASE TABLE / VIEW
        }

        $objects = array_values(array_filter($objects, fn($n) => isset($map[$n])));

        if (!$objects) {
            return response()->json(['message' => 'Tidak ada objek yang valid dipilih.'], 422);
        }

        $buf = [];

        foreach ($objects as $name) {
            $type = $map[$name];
            $isView = ($type === 'VIEW');

            if ($mode === 'describe') {
                $buf[] = "=== DESCRIBE {$schema}.{$name} ===";

                $cols = DB::select(
                    "SELECT column_name, data_type, is_nullable, column_default
                     FROM information_schema.columns
                     WHERE table_schema = ?
                       AND table_name = ?
                     ORDER BY ordinal_position",
                    [$schema, $name]
                );

                // Primary key cols (kalau table)
                $pkCols = [];
                if (!$isView) {
                    $pk = DB::select(
                        "SELECT a.attname AS column_name
                         FROM pg_index i
                         JOIN pg_class c ON c.oid = i.indrelid
                         JOIN pg_namespace n ON n.oid = c.relnamespace
                         JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(i.indkey)
                         WHERE n.nspname = ?
                           AND c.relname = ?
                           AND i.indisprimary = true
                         ORDER BY a.attnum",
                        [$schema, $name]
                    );
                    $pkCols = array_map(fn($r) => $r->column_name, $pk);
                }

                $buf[] = "Field | Type | Null | Key | Default";
                $buf[] = "----- | ---- | ---- | --- | -------";

                foreach ($cols as $c) {
                    $key = in_array($c->column_name, $pkCols, true) ? 'PRI' : '';
                    $def = $c->column_default === null ? 'NULL' : (string)$c->column_default;

                    $buf[] = sprintf(
                        "%s | %s | %s | %s | %s",
                        $c->column_name,
                        $c->data_type,
                        $c->is_nullable,
                        $key,
                        $def
                    );
                }

                $buf[] = "";
                continue;
            }

            // mode: create
            if ($isView) {
                $buf[] = "=== SHOW CREATE VIEW {$schema}.{$name} ===";

                // Ambil definisi view (aman karena regclass disusun dari schema + name yang tervalidasi)
                $def = DB::selectOne(
                    "SELECT pg_get_viewdef((? || '.' || ?)::regclass, true) AS def",
                    [$schema, $name]
                );

                $buf[] = "CREATE OR REPLACE VIEW \"{$schema}\".\"{$name}\" AS";
                $buf[] = rtrim($def->def ?? '') . ";";
                $buf[] = "";
                continue;
            }

            // TABLE: best-effort CREATE TABLE (kolom + default + not null + PK)
            $buf[] = "=== SHOW CREATE TABLE {$schema}.{$name} (best-effort) ===";

            $cols = DB::select(
                "SELECT column_name, data_type, is_nullable, column_default
                 FROM information_schema.columns
                 WHERE table_schema = ?
                   AND table_name = ?
                 ORDER BY ordinal_position",
                [$schema, $name]
            );

            $pk = DB::select(
                "SELECT a.attname AS column_name
                 FROM pg_index i
                 JOIN pg_class c ON c.oid = i.indrelid
                 JOIN pg_namespace n ON n.oid = c.relnamespace
                 JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(i.indkey)
                 WHERE n.nspname = ?
                   AND c.relname = ?
                   AND i.indisprimary = true
                 ORDER BY a.attnum",
                [$schema, $name]
            );
            $pkCols = array_map(fn($r) => $r->column_name, $pk);

            $lines = [];
            foreach ($cols as $c) {
                $line = "\"{$c->column_name}\" {$c->data_type}";
                if ($c->column_default !== null) $line .= " DEFAULT {$c->column_default}";
                if ($c->is_nullable === 'NO') $line .= " NOT NULL";
                $lines[] = $line;
            }

            if ($pkCols) {
                $pkList = implode(', ', array_map(fn($x) => "\"{$x}\"", $pkCols));
                $lines[] = "PRIMARY KEY ({$pkList})";
            }

            $buf[] = "CREATE TABLE \"{$schema}\".\"{$name}\" (";
            $buf[] = "  " . implode(",\n  ", $lines);
            $buf[] = ");";
            $buf[] = "";
        }

        return response()->json([
            'mode' => $mode,
            'output' => implode("\n", $buf),
        ]);
    }
}
