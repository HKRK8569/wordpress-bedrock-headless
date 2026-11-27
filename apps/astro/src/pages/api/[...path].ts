import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { Hono, type Context } from 'hono';
import { z } from 'zod';

export const prerender = false;

const app = new Hono({ strict: false }).basePath('/api');
const postIdSchema = z.string().regex(/^[1-9]\d*$/).transform(Number).pipe(z.int());

app.get('/health', (c) => c.json({ status: 'ok' }));

app.get('/posts', (c) => getWordPressPosts(c));

app.get('/posts/:id', (c) => {
  const id = postIdSchema.safeParse(c.req.param('id'));
  if (!id.success) {
    return c.json({ error: 'Invalid post ID' }, 400);
  }

  return getWordPressPosts(c, id.data);
});

async function getWordPressPosts(c: Context, id?: number) {
  try {
    const url = new URL(getSecret('WORDPRESS_URL') ?? 'http://localhost:8080/');
    url.searchParams.set('rest_route', id === undefined ? '/wp/v2/posts' : `/wp/v2/posts/${id}`);

    if (id === undefined) {
      for (const name of ['page', 'per_page']) {
        const value = c.req.query(name);
        if (value !== undefined) {
          url.searchParams.set(name, value);
        }
      }
    }

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    const body = await response.json();

    if (!response.ok) {
      if (id === undefined && response.status === 400) {
        return c.json(body, 400);
      }

      if (id !== undefined && [401, 403, 404].includes(response.status)) {
        return c.json({ error: 'Post not found' }, 404);
      }

      throw new Error(`WordPress returned ${response.status}`);
    }

    for (const name of ['X-WP-Total', 'X-WP-TotalPages']) {
      const value = response.headers.get(name);
      if (value !== null) {
        c.header(name, value);
      }
    }
    return c.json(body);
  } catch {
    return c.json({ error: 'WordPress request failed' }, 502);
  }
}

export const ALL: APIRoute = ({ request }) => app.fetch(request);
