// /api/で始まるリクエストを処理するWorker。
// それ以外のURLはwrangler.jsoncの設定により、dist/の静的ファイルがそのまま返る。

type Post = {
	id: number;
	name: string;
	message: string;
	created_at: string;
};

export default {
	async fetch(request, env): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === '/api/posts' && request.method === 'GET') {
			return listPosts(env);
		}
		if (url.pathname === '/api/posts' && request.method === 'POST') {
			return createPost(request, env);
		}
		const match = url.pathname.match(/^\/api\/posts\/(\d+)$/);
		if (match && request.method === 'DELETE') {
			return deletePost(request, env, Number(match[1]));
		}

		return Response.json({ error: 'Not Found' }, { status: 404 });
	},
} satisfies ExportedHandler<Env>;

// 新しい順に50件を返す
async function listPosts(env: Env): Promise<Response> {
	const { results } = await env.DB.prepare(
		'SELECT id, name, message, created_at FROM posts ORDER BY id DESC LIMIT 50',
	).all<Post>();
	return Response.json(results);
}

// 送られてきたJSON（{ name, message }）を検証して保存する
async function createPost(request: Request, env: Env): Promise<Response> {
	let body: { name?: unknown; message?: unknown };
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: 'JSONの形式が正しくありません' }, { status: 400 });
	}

	const name = typeof body.name === 'string' ? body.name.trim() : '';
	const message = typeof body.message === 'string' ? body.message.trim() : '';
	const maxLength = Number(env.MAX_MESSAGE_LENGTH);

	if (name === '' || message === '') {
		return Response.json({ error: '名前とひとことを入力してください' }, { status: 400 });
	}
	if (name.length > 20 || message.length > maxLength) {
		return Response.json(
			{ error: `名前は20文字以内、ひとことは${maxLength}文字以内で入力してください` },
			{ status: 400 },
		);
	}

	// ?の位置に値を渡すと、SQLインジェクションを防げる
	const post = await env.DB.prepare(
		'INSERT INTO posts (name, message) VALUES (?, ?) RETURNING id, name, message, created_at',
	)
		.bind(name, message)
		.first<Post>();
	return Response.json(post, { status: 201 });
}

// 管理者だけが投稿を削除できる。ADMIN_TOKENはSecretとして登録する
async function deletePost(request: Request, env: Env, id: number): Promise<Response> {
	if (!env.ADMIN_TOKEN || request.headers.get('Authorization') !== `Bearer ${env.ADMIN_TOKEN}`) {
		return Response.json({ error: '削除する権限がありません' }, { status: 401 });
	}
	await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
	return new Response(null, { status: 204 });
}
