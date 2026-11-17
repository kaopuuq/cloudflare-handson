-- 投稿を保存するテーブル
CREATE TABLE posts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	message TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
