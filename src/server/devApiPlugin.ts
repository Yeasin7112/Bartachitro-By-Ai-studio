import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import type { Advertisement } from '../types';
import { 
  INITIAL_NEWS, 
  INITIAL_CATEGORIES, 
  INITIAL_ADS, 
  INITIAL_EPAPER, 
  INITIAL_SETTINGS, 
  INITIAL_MESSAGES, 
  INITIAL_BLOGS, 
  INITIAL_USERS 
} from '../data/initialData';

export function devApiPlugin(): Plugin {
  // In-memory / file-persisted storage for development preview
  const dataDir = path.resolve(process.cwd(), '.dev-data');
  const uploadDir = path.resolve(process.cwd(), 'public/uploads');

  if (!fs.existsSync(dataDir)) {
    try { fs.mkdirSync(dataDir, { recursive: true }); } catch {}
  }
  if (!fs.existsSync(uploadDir)) {
    try { fs.mkdirSync(uploadDir, { recursive: true }); } catch {}
  }

  const loadOrCreate = <T>(fileName: string, fallback: T): T => {
    const filePath = path.join(dataDir, fileName);
    if (fs.existsSync(filePath)) {
      try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch {}
    }
    try {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf8');
    } catch {}
    return fallback;
  };

  const persist = <T>(fileName: string, data: T) => {
    try {
      fs.writeFileSync(path.join(dataDir, fileName), JSON.stringify(data, null, 2), 'utf8');
    } catch {}
  };

  let settings = loadOrCreate('settings.json', INITIAL_SETTINGS);
  let newsList = loadOrCreate('news.json', INITIAL_NEWS);
  let categories = loadOrCreate('categories.json', INITIAL_CATEGORIES);
  let ads = loadOrCreate('ads.json', INITIAL_ADS);
  let epaper = loadOrCreate('epaper.json', INITIAL_EPAPER);
  let messages = loadOrCreate('messages.json', INITIAL_MESSAGES);
  let blogs = loadOrCreate('blogs.json', INITIAL_BLOGS);
  let users = loadOrCreate('users.json', INITIAL_USERS);
  let subscribers = loadOrCreate('subscribers.json', [
    { id: 1, email: 'reader@bartachitro.com', created_at: '2026-09-01 10:00:00' }
  ]);
  const activeSessions = new Map<string, any>();

  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlStr = req.url || '';

        // Serve uploaded files statically
        if (urlStr.startsWith('/uploads/')) {
          const fileName = path.basename(urlStr.split('?')[0]);
          const filePath = path.join(uploadDir, fileName);
          if (fs.existsSync(filePath)) {
            const ext = path.extname(fileName).toLowerCase();
            const mimeTypes: Record<string, string> = {
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.png': 'image/png',
              '.webp': 'image/webp',
              '.svg': 'image/svg+xml',
              '.gif': 'image/gif',
              '.ico': 'image/x-icon',
              '.mp4': 'video/mp4',
              '.webm': 'video/webm',
              '.ogg': 'video/ogg',
              '.mov': 'video/quicktime'
            };
            res.statusCode = 200;
            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            res.setHeader('Access-Control-Allow-Origin', '*');
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }

        if (!urlStr.startsWith('/api/')) {
          return next();
        }

        const urlObj = new URL(urlStr, 'http://localhost:3000');
        const pathname = urlObj.pathname.replace(/\.php$/, ''); // Normalize /api/news.php to /api/news
        const method = req.method?.toUpperCase() || 'GET';

        // Helper to read raw body buffer
        const readRawBodyBuffer = async (): Promise<Buffer> => {
          return new Promise((resolve) => {
            const chunks: Buffer[] = [];
            req.on('data', (chunk) => {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            });
            req.on('end', () => {
              resolve(Buffer.concat(chunks));
            });
          });
        };

        // Helper to read JSON request body
        const readJsonBody = async (): Promise<any> => {
          return new Promise((resolve) => {
            let body = '';
            req.on('data', (chunk) => { body += chunk; });
            req.on('end', () => {
              try {
                resolve(JSON.parse(body));
              } catch {
                resolve({});
              }
            });
          });
        };

        const sendJson = (data: any, status = 200) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(data));
        };

        // 1. Settings API
        if (pathname === '/api/settings') {
          if (method === 'GET') {
            return sendJson({ status: 'ok', data: settings, source: 'mysql' });
          }
          if (method === 'POST' || method === 'PUT') {
            const body = await readJsonBody();
            settings = { ...settings, ...body };
            persist('settings.json', settings);
            return sendJson({ status: 'ok', message: 'Settings saved successfully', data: settings });
          }
        }

        // 2. News API
        if (pathname === '/api/news') {
          if (method === 'GET') {
            const idParam = urlObj.searchParams.get('id');
            const slugParam = urlObj.searchParams.get('slug');
            const catIdParam = urlObj.searchParams.get('category_id');
            const catSlugParam = urlObj.searchParams.get('category_slug');
            const breakingParam = urlObj.searchParams.get('is_breaking');
            const featuredParam = urlObj.searchParams.get('is_featured');
            const searchParam = urlObj.searchParams.get('search');
            const statusParam = urlObj.searchParams.get('status');
            const limitParam = parseInt(urlObj.searchParams.get('limit') || '100', 10);

            if (idParam) {
              const item = newsList.find(n => n.id === parseInt(idParam, 10));
              return item ? sendJson({ status: 'ok', data: item }) : sendJson({ error: 'Article not found' }, 404);
            }

            if (slugParam) {
              const item = newsList.find(n => n.slug === slugParam);
              return item ? sendJson({ status: 'ok', data: item }) : sendJson({ error: 'Article not found' }, 404);
            }

            let result = [...newsList];
            if (statusParam && statusParam !== 'all') {
              result = result.filter(n => n.status === statusParam);
            }
            if (catIdParam) {
              const cid = parseInt(catIdParam, 10);
              result = result.filter(n => n.category_id === cid);
            }
            if (catSlugParam && catSlugParam !== 'home') {
              const cat = categories.find(c => c.slug === catSlugParam);
              if (cat) {
                result = result.filter(n => n.category_id === cat.id);
              }
            }
            if (breakingParam !== null) {
              const isBrk = breakingParam === '1' || breakingParam === 'true';
              result = result.filter(n => n.is_breaking === isBrk);
            }
            if (featuredParam !== null) {
              const isFeat = featuredParam === '1' || featuredParam === 'true';
              result = result.filter(n => n.is_featured === isFeat);
            }
            if (searchParam) {
              const q = searchParam.toLowerCase();
              result = result.filter(n => 
                n.title.toLowerCase().includes(q) || 
                n.summary.toLowerCase().includes(q) || 
                n.content.toLowerCase().includes(q)
              );
            }

            result.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
            return sendJson({ status: 'ok', data: result.slice(0, limitParam) });
          }

          if (method === 'POST') {
            const body = await readJsonBody();
            const newId = newsList.length > 0 ? Math.max(...newsList.map(n => n.id)) + 1 : 1;
            const newArticle = {
              id: newId,
              category_id: Number(body.category_id) || 1,
              author_id: Number(body.author_id) || 1,
              title: body.title || 'শিরোনামবিহীন',
              slug: body.slug || `news-${newId}-${Date.now()}`,
              summary: body.summary || '',
              content: body.content || '',
              author_name: body.author_name || 'বার্তাচিত্র প্রতিবেদক',
              featured_image: body.featured_image || '',
              image_caption: body.image_caption || '',
              video_url: body.video_url || '',
              views: Number(body.views) || 0,
              is_featured: Boolean(body.is_featured),
              is_breaking: Boolean(body.is_breaking),
              status: body.status || 'published',
              published_at: body.published_at || new Date().toISOString(),
              seo_title: body.seo_title || body.title,
              seo_description: body.seo_description || body.summary,
              seo_keywords: body.seo_keywords || ''
            };
            newsList = [newArticle, ...newsList];
            persist('news.json', newsList);

            // Automatically synchronize into epaper edition
            const publishedCount = newsList.filter(n => n.status === 'published').length;
            epaper = {
              ...epaper,
              edition_date: new Date().toISOString().slice(0, 10),
              total_pages: Math.max(1, publishedCount + 1)
            };
            persist('epaper.json', epaper);

            return sendJson({ status: 'ok', id: newId, data: newArticle, message: 'Article created successfully' }, 201);
          }

          if (method === 'PUT') {
            const body = await readJsonBody();
            const id = parseInt(urlObj.searchParams.get('id') || body.id, 10);
            if (!id) return sendJson({ error: 'Article ID is required' }, 400);

            if (body.action === 'increment_view') {
              newsList = newsList.map(n => n.id === id ? { ...n, views: n.views + 1 } : n);
              persist('news.json', newsList);
              return sendJson({ status: 'ok', message: 'Views incremented' });
            }

            newsList = newsList.map(n => n.id === id ? { ...n, ...body, id, author_id: Number(body.author_id || (n as any).author_id || 1) } : n);
            persist('news.json', newsList);
            const publishedCount = newsList.filter(n => n.status === 'published').length;
            epaper = { ...epaper, total_pages: Math.max(1, publishedCount + 1) };
            persist('epaper.json', epaper);
            const updated = newsList.find(n => n.id === id);
            return sendJson({ status: 'ok', message: 'Article updated successfully', data: updated });
          }

          if (method === 'DELETE') {
            const body = await readJsonBody();
            const id = parseInt(urlObj.searchParams.get('id') || body.id, 10);
            if (!id) return sendJson({ error: 'Article ID is required' }, 400);

            newsList = newsList.filter(n => n.id !== id);
            persist('news.json', newsList);
            const publishedCount = newsList.filter(n => n.status === 'published').length;
            epaper = { ...epaper, total_pages: Math.max(1, publishedCount + 1) };
            persist('epaper.json', epaper);
            return sendJson({ status: 'ok', message: 'Article deleted successfully', id });
          }
        }

        // 3. Categories API
        if (pathname === '/api/categories') {
          if (method === 'GET') {
            const sorted = [...categories].sort((a, b) => a.display_order - b.display_order);
            return sendJson({ status: 'ok', data: sorted });
          }
          if (method === 'POST') {
            const body = await readJsonBody();
            if (body.action === 'reorder' && Array.isArray(body.orders)) {
              const orderMap = new Map<number, number>(body.orders.map((o: any) => [Number(o.id), Number(o.display_order)]));
              categories = categories.map(c => {
                if (orderMap.has(c.id)) {
                  return { ...c, display_order: orderMap.get(c.id)! };
                }
                return c;
              });
              categories.sort((a, b) => a.display_order - b.display_order);
              persist('categories.json', categories);
              return sendJson({ status: 'ok', message: 'Categories reordered successfully', data: categories });
            }
            const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
            const newCat = {
              id: newId,
              name: body.name || 'নতুন বিভাগ',
              slug: body.slug || `cat-${newId}`,
              name_en: body.name_en || '',
              display_order: Number(body.display_order) || categories.length + 1,
              status: 'active' as const
            };
            categories = [...categories, newCat];
            persist('categories.json', categories);
            return sendJson({ status: 'ok', id: newId, data: newCat, message: 'Category created' }, 201);
          }
          if (method === 'PUT') {
            const body = await readJsonBody();
            if (body.action === 'reorder' && Array.isArray(body.orders)) {
              const orderMap = new Map<number, number>(body.orders.map((o: any) => [Number(o.id), Number(o.display_order)]));
              categories = categories.map(c => {
                if (orderMap.has(c.id)) {
                  return { ...c, display_order: orderMap.get(c.id)! };
                }
                return c;
              });
              categories.sort((a, b) => a.display_order - b.display_order);
              persist('categories.json', categories);
              return sendJson({ status: 'ok', message: 'Categories reordered successfully', data: categories });
            }

            const id = parseInt(urlObj.searchParams.get('id') || body.id, 10);
            categories = categories.map(c => c.id === id ? { ...c, ...body, id } : c);
            categories.sort((a, b) => a.display_order - b.display_order);
            persist('categories.json', categories);
            return sendJson({ status: 'ok', message: 'Category updated', data: body });
          }
          if (method === 'DELETE') {
            const body = await readJsonBody();
            const id = parseInt(urlObj.searchParams.get('id') || body.id, 10);
            categories = categories.filter(c => c.id !== id);
            persist('categories.json', categories);
            return sendJson({ status: 'ok', message: 'Category deleted', id });
          }
        }

        // 4. Ads API
        if (pathname === '/api/ads') {
          if (method === 'GET') {
            return sendJson({ status: 'ok', data: ads });
          }
          if (method === 'POST') {
            const body = await readJsonBody();
            const newId = ads.length > 0 ? Math.max(...ads.map(a => a.id)) + 1 : 1;
            const newAd: Advertisement = {
              id: newId,
              title: body.title || 'বিজ্ঞাপন',
              position: body.position || 'sidebar',
              image_url: body.image_url || '',
              target_url: body.target_url || '#',
              status: 'active' as const,
              clicks: 0,
              views: 0
            };
            ads = [...ads, newAd];
            persist('ads.json', ads);
            return sendJson({ status: 'ok', id: newId, data: newAd }, 201);
          }
          if (method === 'PUT') {
            const body = await readJsonBody();
            const id = parseInt(urlObj.searchParams.get('id') || body.id, 10);
            if (body.action === 'click') {
              ads = ads.map(a => a.id === id ? { ...a, clicks: (a.clicks || 0) + 1 } : a);
              persist('ads.json', ads);
              return sendJson({ status: 'ok', message: 'Click tracked' });
            }
            ads = ads.map(a => a.id === id ? { ...a, ...body, id } : a);
            persist('ads.json', ads);
            return sendJson({ status: 'ok', message: 'Ad updated', data: body });
          }
          if (method === 'DELETE') {
            const body = await readJsonBody();
            const id = parseInt(urlObj.searchParams.get('id') || body.id, 10);
            ads = ads.filter(a => a.id !== id);
            persist('ads.json', ads);
            return sendJson({ status: 'ok', message: 'Ad deleted', id });
          }
        }

        // 5. E-paper API
        if (pathname === '/api/epaper') {
          if (method === 'GET') {
            const list = urlObj.searchParams.get('list');
            if (list === '1') {
              const editions = epaper ? [{
                id: epaper.id,
                title: epaper.title,
                edition_date: epaper.edition_date,
                total_pages: epaper.total_pages || (epaper.pages?.length ?? 1),
                cover_image: epaper.cover_image,
                status: epaper.status || 'published'
              }] : [];
              return sendJson({ status: 'ok', data: editions });
            }
            return sendJson({ status: 'ok', data: epaper });
          }
          if (method === 'POST') {
            const sessionToken = req.headers['x-admin-token'] || req.headers['authorization']?.replace('Bearer ', '');
            if (!sessionToken || !activeSessions.has(sessionToken as string)) {
              return sendJson({ error: 'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে অ্যাডমিন হিসেবে লগইন করুন।' }, 401);
            }
            const body = await readJsonBody();
            epaper = { 
              ...epaper, 
              ...body,
              total_pages: body.pages?.length ? body.pages.length : (body.total_pages || epaper.total_pages || 1)
            };
            persist('epaper.json', epaper);
            return sendJson({ status: 'ok', message: 'E-paper updated', data: epaper });
          }
          if (method === 'DELETE') {
            const sessionToken = req.headers['x-admin-token'] || req.headers['authorization']?.replace('Bearer ', '');
            if (!sessionToken || !activeSessions.has(sessionToken as string)) {
              return sendJson({ error: 'অননুমোদিত অ্যাক্সেস।' }, 401);
            }
            return sendJson({ status: 'ok', message: 'Edition deleted' });
          }
        }

        // 6. Messages API
        if (pathname === '/api/messages') {
          if (method === 'GET') {
            return sendJson({ status: 'ok', data: messages });
          }
          if (method === 'POST') {
            const body = await readJsonBody();
            const newId = messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1;
            const newMsg = {
              id: newId,
              name: body.name || 'নামহীন',
              email: body.email || '',
              phone: body.phone || '',
              subject: body.subject || 'সাধারণ বার্তা',
              message: body.message || '',
              is_read: false,
              created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
            };
            messages = [newMsg, ...messages];
            persist('messages.json', messages);
            return sendJson({ status: 'ok', id: newId, data: newMsg, message: 'Message sent' }, 201);
          }
          if (method === 'PUT') {
            const body = await readJsonBody();
            const id = parseInt(urlObj.searchParams.get('id') || body.id, 10);
            messages = messages.map(m => m.id === id ? { ...m, is_read: body.is_read !== undefined ? Boolean(body.is_read) : true } : m);
            persist('messages.json', messages);
            return sendJson({ status: 'ok', message: 'Message marked read' });
          }
          if (method === 'DELETE') {
            const body = await readJsonBody();
            const id = parseInt(urlObj.searchParams.get('id') || body.id, 10);
            messages = messages.filter(m => m.id !== id);
            persist('messages.json', messages);
            return sendJson({ status: 'ok', message: 'Message deleted', id });
          }
        }

        // 6.5 Newsletter / Subscribers API
        if (pathname === '/api/newsletter' || pathname === '/api/subscribers') {
          if (method === 'GET') {
            return sendJson({ status: 'ok', data: subscribers });
          }
          if (method === 'POST') {
            const body = await readJsonBody();
            const email = (body.email || '').trim().toLowerCase();
            if (!email || !email.includes('@') || !email.includes('.')) {
              return sendJson({ status: 'error', message: 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা প্রদান করুন।' }, 400);
            }
            const exists = subscribers.some(s => s.email.toLowerCase() === email);
            if (exists) {
              return sendJson({ status: 'ok', message: 'আপনি ইতোমধ্যে আমাদের নিউজলেটারে যুক্ত আছেন!' });
            }
            const newSub = {
              id: subscribers.length > 0 ? Math.max(...subscribers.map(s => s.id)) + 1 : 1,
              email,
              created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
            };
            subscribers = [newSub, ...subscribers];
            persist('subscribers.json', subscribers);
            return sendJson({ status: 'ok', message: 'নিউজলেটারে সফলভাবে সাবস্ক্রাইব করা হয়েছে! আপনাকে ধন্যবাদ।', data: newSub }, 201);
          }
        }

        // 7. Blogs API
        if (pathname === '/api/blogs') {
          if (method === 'GET') {
            const idParam = urlObj.searchParams.get('id');
            const slugParam = urlObj.searchParams.get('slug');
            if (idParam) {
              const item = blogs.find(b => b.id === parseInt(idParam, 10));
              return item ? sendJson({ status: 'ok', data: item }) : sendJson({ error: 'Blog not found' }, 404);
            }
            if (slugParam) {
              const item = blogs.find(b => b.slug === slugParam);
              return item ? sendJson({ status: 'ok', data: item }) : sendJson({ error: 'Blog not found' }, 404);
            }
            return sendJson({ status: 'ok', data: blogs });
          }
          if (method === 'POST') {
            const body = await readJsonBody();
            const newId = blogs.length > 0 ? Math.max(...blogs.map(b => b.id)) + 1 : 1;
            const newBlog = {
              id: newId,
              title: body.title || 'শিরোনামহীন মতামত',
              slug: body.slug || `blog-${newId}-${Date.now()}`,
              summary: body.summary || '',
              content: body.content || '',
              author_name: body.author_name || 'বার্তাচিত্র কলামিস্ট',
              author_role: body.author_role || 'কলামিস্ট',
              author_avatar: body.author_avatar || '',
              cover_image: body.cover_image || '',
              video_url: body.video_url || '',
              category_tag: body.category_tag || 'মতামত',
              reading_time_min: Number(body.reading_time_min) || 4,
              views: 0,
              likes: 0,
              is_featured: Boolean(body.is_featured),
              status: body.status || 'published',
              published_at: body.published_at || new Date().toISOString(),
              tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(',') : [])
            };
            blogs = [newBlog, ...blogs];
            persist('blogs.json', blogs);
            return sendJson({ status: 'ok', id: newId, data: newBlog }, 201);
          }
          if (method === 'PUT') {
            const body = await readJsonBody();
            const id = parseInt(urlObj.searchParams.get('id') || body.id, 10);
            if (body.action === 'like') {
              blogs = blogs.map(b => b.id === id ? { ...b, likes: b.likes + 1 } : b);
              persist('blogs.json', blogs);
              return sendJson({ status: 'ok', message: 'Blog liked' });
            }
            if (body.action === 'view') {
              blogs = blogs.map(b => b.id === id ? { ...b, views: b.views + 1 } : b);
              persist('blogs.json', blogs);
              return sendJson({ status: 'ok', message: 'Blog view counted' });
            }
            blogs = blogs.map(b => b.id === id ? { ...b, ...body, id } : b);
            persist('blogs.json', blogs);
            return sendJson({ status: 'ok', message: 'Blog updated', data: body });
          }
          if (method === 'DELETE') {
            const body = await readJsonBody();
            const id = parseInt(urlObj.searchParams.get('id') || body.id, 10);
            blogs = blogs.filter(b => b.id !== id);
            persist('blogs.json', blogs);
            return sendJson({ status: 'ok', message: 'Blog deleted', id });
          }
        }

        // 8. Users API
        if (pathname === '/api/users') {
          if (method === 'GET') {
            const sanitized = users.map(u => ({
              id: u.id,
              name: u.name,
              username: u.username,
              email: u.email,
              role: u.role,
              role_title: u.role_title,
              avatar: u.avatar,
              status: u.status,
              created_at: u.created_at,
              last_login: u.last_login
            }));
            return sendJson({ status: 'ok', data: sanitized });
          }
          if (method === 'POST') {
            const body = await readJsonBody();
            const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
            const newUser = {
              id: newId,
              name: body.name || 'ব্যবহারকারী',
              username: body.username || `user_${newId}`,
              email: body.email || `user_${newId}@bartachitro.com`,
              password: body.password || 'Admin@1234',
              role: body.role || 'editor',
              role_title: body.role_title || 'সহকারী সম্পাদক',
              avatar: body.avatar || '',
              status: body.status || 'active',
              created_at: new Date().toISOString()
            };
            users = [...users, newUser];
            persist('users.json', users);
            return sendJson({ status: 'ok', id: newId, data: newUser }, 201);
          }
          if (method === 'PUT') {
            const body = await readJsonBody();
            const id = parseInt(urlObj.searchParams.get('id') || body.id, 10);
            users = users.map(u => u.id === id ? { 
              ...u, 
              ...body, 
              id,
              password: body.password ? body.password : u.password 
            } : u);
            persist('users.json', users);
            return sendJson({ status: 'ok', message: 'User updated' });
          }
          if (method === 'DELETE') {
            const body = await readJsonBody();
            const id = parseInt(urlObj.searchParams.get('id') || body.id, 10);
            if (id === 1) return sendJson({ error: 'Cannot delete primary admin' }, 403);
            users = users.filter(u => u.id !== id);
            persist('users.json', users);
            return sendJson({ status: 'ok', message: 'User deleted', id });
          }
        }

        // 9. Auth API
        if (pathname === '/api/auth' || pathname === '/api/auth/change-password' || pathname === '/api/users/change-password') {
          const action = urlObj.searchParams.get('action') || (pathname.includes('change-password') ? 'change-password' : 'login');

          // 9.1 Password Update Option: old password, new password, confirm new password
          if (action === 'change-password' || pathname === '/api/auth/change-password' || pathname === '/api/users/change-password') {
            if (method === 'POST') {
              const body = await readJsonBody();
              const userId = body.userId ? parseInt(body.userId, 10) : undefined;
              const username = (body.username || '').trim().toLowerCase();
              const oldPassword = (body.oldPassword || body.old_password || '').trim();
              const newPassword = (body.newPassword || body.new_password || '').trim();
              const confirmPassword = (body.confirmPassword || body.confirm_password || '').trim();

              if (!oldPassword) {
                return sendJson({ status: 'error', message: 'পুরাতন পাসওয়ার্ড প্রদান করা আবশ্যক।' }, 400);
              }
              if (!newPassword) {
                return sendJson({ status: 'error', message: 'নতুন পাসওয়ার্ড প্রদান করা আবশ্যক।' }, 400);
              }
              if (newPassword.length < 4) {
                return sendJson({ status: 'error', message: 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' }, 400);
              }
              if (newPassword !== confirmPassword) {
                return sendJson({ status: 'error', message: 'নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড হুবহু মিলছে না।' }, 400);
              }
              if (oldPassword === newPassword) {
                return sendJson({ status: 'error', message: 'নতুন পাসওয়ার্ড পুরাতন পাসওয়ার্ডের চেয়ে ভিন্ন হতে হবে।' }, 400);
              }

              // Find target user by userId or username
              let targetUser = users.find(u => 
                (userId !== undefined && u.id === userId) ||
                (username && (u.username.toLowerCase() === username || u.email.toLowerCase() === username))
              );

              if (!targetUser) {
                targetUser = users[0];
              }

              if (!targetUser) {
                return sendJson({ status: 'error', message: 'ব্যবহারকারী অ্যাকাউন্ট পাওয়া যায়নি।' }, 404);
              }

              // Verify old password (check stored password or default dev password)
              const storedPassword = (targetUser as any).password;
              const isOldMatch = storedPassword 
                ? (oldPassword === storedPassword)
                : (oldPassword === 'admin123' || oldPassword === 'Admin@1234');

              if (!isOldMatch) {
                return sendJson({ 
                  status: 'error', 
                  message: 'পুরাতন পাসওয়ার্ডটি সঠিক নয়। অনুগ্রহ করে আপনার বর্তমান সঠিক পাসওয়ার্ড লিখুন।' 
                }, 400);
              }

              // Update password for this user
              users = users.map(u => u.id === targetUser!.id ? { ...u, password: newPassword } : u);
              persist('users.json', users);

              return sendJson({
                status: 'ok',
                message: `"${targetUser.name}" এর পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!`
              });
            }
          }

          if (method === 'POST' && action === 'login') {
            const body = await readJsonBody();
            const username = (body.username || '').trim().toLowerCase();
            const password = (body.password || '').trim();

            const matchedUser = users.find(u => 
              (u.username.toLowerCase() === username || u.email.toLowerCase() === username) && 
              u.status === 'active'
            );

            // In dev mode: if user exists, check against stored password or dev fallback
            if (matchedUser) {
              const expectedPassword = (matchedUser as any).password || 'admin123';
              if (password === expectedPassword || password === 'admin123' || password === 'Admin@1234') {
                return sendJson({
                  status: 'ok',
                  message: 'লগইন সফল হয়েছে',
                  user: matchedUser,
                  token: 'dev-session-token-' + Date.now()
                });
              } else {
                return sendJson({ error: 'ভুল পাসওয়ার্ড। অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।' }, 401);
              }
            } else {
              return sendJson({ error: 'ভুল ইউজারনেম অথবা পাসওয়ার্ড' }, 401);
            }
          }
          if (action === 'me' || (method === 'GET' && !urlObj.searchParams.get('action'))) {
            const authHeader = req.headers['authorization'] || '';
            const hasAuthToken = authHeader.startsWith('Bearer ') && authHeader.length > 15;
            if (hasAuthToken) {
              const firstAdmin = users.find(u => u.role === 'super_admin') || users[0];
              return sendJson({ status: 'ok', authenticated: true, user: firstAdmin });
            }
            return sendJson({ status: 'guest', authenticated: false }, 200);
          }
          if (action === 'logout') {
            return sendJson({ status: 'ok', message: 'লগআউট সফল হয়েছে' });
          }
        }

        // 10. File Upload API (Supports multipart FormData and base64 JSON for images & videos)
        if (pathname === '/api/upload') {
          if (method === 'POST') {
            const contentType = req.headers['content-type'] || '';
            const rawBuffer = await readRawBodyBuffer();

            // 1. Multipart Form Data (from FormData in browser)
            if (contentType.includes('multipart/form-data')) {
              const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
              const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]).trim() : '';

              if (boundary && rawBuffer.length > 0) {
                const boundaryBuffer = Buffer.from(`--${boundary}`);
                const boundaryIndex = rawBuffer.indexOf(boundaryBuffer);
                if (boundaryIndex !== -1) {
                  const headerStart = boundaryIndex + boundaryBuffer.length;
                  const headerEnd = rawBuffer.indexOf(Buffer.from('\r\n\r\n'), headerStart);
                  if (headerEnd !== -1) {
                    const headerStr = rawBuffer.subarray(headerStart, headerEnd).toString('latin1');
                    const filenameMatch = headerStr.match(/filename="([^"]+)"/i) || headerStr.match(/filename=([^\s;]+)/i);
                    const originalFilename = filenameMatch ? filenameMatch[1].replace(/^.*[\\\/]/, '') : 'upload_media';
                    
                    const dataStart = headerEnd + 4;
                    const nextBoundaryIndex = rawBuffer.indexOf(boundaryBuffer, dataStart);
                    if (nextBoundaryIndex !== -1) {
                      let dataEnd = nextBoundaryIndex;
                      // Strip trailing CRLF right before next boundary
                      if (dataEnd >= 2 && rawBuffer[dataEnd - 2] === 13 && rawBuffer[dataEnd - 1] === 10) {
                        dataEnd -= 2;
                      }
                      const fileData = rawBuffer.subarray(dataStart, dataEnd);

                      let ext = path.extname(originalFilename).toLowerCase().replace('.', '');
                      if (!ext) {
                        const ctMatch = headerStr.match(/Content-Type:\s*([^\s;]+)/i);
                        const ct = ctMatch ? ctMatch[1].toLowerCase() : '';
                        if (ct.includes('png')) ext = 'png';
                        else if (ct.includes('webp')) ext = 'webp';
                        else if (ct.includes('svg')) ext = 'svg';
                        else if (ct.includes('gif')) ext = 'gif';
                        else if (ct.includes('ico')) ext = 'ico';
                        else if (ct.includes('mp4')) ext = 'mp4';
                        else if (ct.includes('webm')) ext = 'webm';
                        else if (ct.includes('ogg')) ext = 'ogg';
                        else if (ct.includes('mov') || ct.includes('quicktime')) ext = 'mov';
                        else ext = 'jpg';
                      }

                      const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'mkv', 'avi'].includes(ext);
                      const prefix = isVideo ? 'video-' : 'upload-';
                      const safeFilename = `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
                      const filePath = path.join(uploadDir, safeFilename);

                      fs.writeFileSync(filePath, fileData);
                      return sendJson({
                        status: 'ok',
                        url: `/uploads/${safeFilename}`,
                        filename: safeFilename,
                        size: fileData.length,
                        message: 'File uploaded successfully'
                      });
                    }
                  }
                }
              }
            }

            // 2. Base64 JSON Body
            try {
              const body = JSON.parse(rawBuffer.toString('utf8') || '{}');
              const base64Str = body.image || body.file || body.video;
              if (base64Str && typeof base64Str === 'string') {
                const matches = base64Str.match(/^data:([^;]+);base64,(.+)$/s);
                if (matches) {
                  const mime = matches[1].toLowerCase();
                  let ext = 'jpg';
                  let prefix = 'upload-';

                  if (mime.includes('png')) ext = 'png';
                  else if (mime.includes('webp')) ext = 'webp';
                  else if (mime.includes('svg')) ext = 'svg';
                  else if (mime.includes('gif')) ext = 'gif';
                  else if (mime.includes('ico')) ext = 'ico';
                  else if (mime.includes('mp4')) { ext = 'mp4'; prefix = 'video-'; }
                  else if (mime.includes('webm')) { ext = 'webm'; prefix = 'video-'; }
                  else if (mime.includes('ogg')) { ext = 'ogg'; prefix = 'video-'; }
                  else if (mime.includes('quicktime') || mime.includes('mov')) { ext = 'mov'; prefix = 'video-'; }

                  const buffer = Buffer.from(matches[2], 'base64');
                  const filename = `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
                  const filePath = path.join(uploadDir, filename);
                  fs.writeFileSync(filePath, buffer);
                  const fileUrl = `/uploads/${filename}`;
                  return sendJson({
                    status: 'ok',
                    url: fileUrl,
                    filename,
                    size: buffer.length,
                    message: 'Media uploaded successfully'
                  });
                }
              }
            } catch {}

            return sendJson({ error: 'No valid image or video file received' }, 400);
          }
        }

        return next();
      });
    }
  };
}
