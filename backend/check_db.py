import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'sentiverse.db')

def inspect_database():
    if not os.path.exists(DB_PATH):
        print(f"Database file not found at: {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("\n" + "="*60)
    print(" SENTIVERSE AI - DATABASE INSPECTION TOOL")
    print("="*60)
    print(f" Location: {DB_PATH}")
    print(f" Size: {os.path.getsize(DB_PATH) / 1024:.2f} KB\n")

    # List all tables
    tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
    table_names = [t['name'] for t in tables if t['name'] != 'sqlite_sequence']
    print(f"Tables Found ({len(table_names)}): {', '.join(table_names)}\n")

    for table in table_names:
        count = cursor.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        print("-" * 60)
        print(f" TABLE: {table.upper()} (Total Records: {count})")
        print("-" * 60)

        rows = cursor.execute(f"SELECT * FROM {table} ORDER BY 1 DESC LIMIT 5").fetchall()
        if not rows:
            print("  [No records found]")
        else:
            for idx, r in enumerate(rows, 1):
                row_dict = dict(r)
                # Truncate long text fields for clean terminal display
                for k, v in row_dict.items():
                    if isinstance(v, str) and len(v) > 60:
                        row_dict[k] = v[:57] + "..."
                print(f"  Row #{idx}: {row_dict}")
        print()

    conn.close()

if __name__ == '__main__':
    inspect_database()
