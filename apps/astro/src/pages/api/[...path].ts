import type { APIRoute } from 'astro';
import { Hono } from 'hono';

export const prerender = false;

const app = new Hono({ strict: false }).basePath('/api');

app.get('/health', (c) => c.json({ status: 'ok' }));

export const ALL: APIRoute = ({ request }) => app.fetch(request);
