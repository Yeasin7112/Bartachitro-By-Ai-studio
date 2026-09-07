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

  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlStr = req.url || '';
        if (!urlStr.startsWith('/api/')) {
          return next();
        }

        const urlObj = new URL(urlStr, 'http://localhost:3000');
        const pathname = urlObj.pathname.replace(/\.php$/, ''); // Normalize /api/news.php to /api/news
        const method = req.method?.toUpperCase() || 'GET';

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
            const updated = newsList.find(n => n.id === id);
            return sendJson({ status: 'ok', message: 'Article updated successfully', data: updated });
          }

          if (method === 'DELETE') {
            const body = await readJsonBody();
            const id = parseInt(urlObj.searchParams.get('id') || body.id, 10);
            if (!id) return sendJson({ error: 'Article ID is required' }, 400);

            newsList = newsList.filter(n => n.id !== id);
            persist('news.json', newsList);
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
            const id = parseInt(urlObj.searchParams.get('id') || body.id, 10);
            categories = categories.map(c => c.id === id ? { ...c, ...body, id } : c);
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
            return sendJson({ status: 'ok', data: epaper });
          }
          if (method === 'POST') {
            const body = await readJsonBody();
            epaper = { ...epaper, ...body };
            persist('epaper.json', epaper);
            return sendJson({ status: 'ok', message: 'E-paper updated', data: epaper });
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
            users = users.map(u => u.id === id ? { ...u, ...body, id } : u);
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
        if (pathname === '/api/auth') {
          const action = urlObj.searchParams.get('action') || 'login';
          if (method === 'POST' && action === 'login') {
            const body = await readJsonBody();
            const username = (body.username || '').trim().toLowerCase();
            const password = (body.password || '').trim();

            const matchedUser = users.find(u => 
              (u.username.toLowerCase() === username || u.email.toLowerCase() === username) && 
              u.status === 'active'
            );

            // In dev mode: if user exists and password is provided, or admin / admin123 initial setup
            if (matchedUser && (password.length >= 4)) {
              return sendJson({
                status: 'ok',
                message: 'লগইন সফল হয়েছে',
                user: matchedUser,
                token: 'dev-session-token-' + Date.now()
              });
            } else {
              return sendJson({ error: 'ভুল ইউজারনেম অথবা পাসওয়ার্ড' }, 401);
            }
          }
          if (action === 'me' || (method === 'GET' && !urlObj.searchParams.get('action'))) {
            const firstAdmin = users.find(u => u.role === 'super_admin') || users[0];
            return sendJson({ status: 'ok', authenticated: true, user: firstAdmin });
          }
          if (action === 'logout') {
            return sendJson({ status: 'ok', message: 'লগআউট সফল হয়েছে' });
          }
        }

        // 10. File Upload API
        if (pathname === '/api/upload') {
          if (method === 'POST') {
            const body = await readJsonBody();
            if (body && body.image) {
              const base64Str = body.image;
              const matches = base64Str.match(/^data:image\/(\w+);base64,(.+)$/);
              if (matches) {
                const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                const buffer = Buffer.from(matches[2], 'base64');
                const filename = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
                const filePath = path.join(uploadDir, filename);
                fs.writeFileSync(filePath, buffer);
                const fileUrl = `/uploads/${filename}`;
                return sendJson({
                  status: 'ok',
                  url: fileUrl,
                  filename,
                  message: 'Image uploaded successfully'
                });
              }
            }
            return sendJson({ error: 'No valid image data received' }, 400);
          }
        }

        return next();
      });
    }
  };
}
