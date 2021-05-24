import { Application, Router, RouterContext, Context, config } from './deps.ts';

const client_id = config({path: '../.env'}).CLIENT_ID;
const client_secret = config({path: '../.env'}).CLIENT_SECRET;

// TODO this probably shouldn't have so many hardcoded localhosts...

// TODO replace this with our org
const owner = 'coreymarchetti-ema';

const app = new Application();
const router = new Router(); 

const port: number = 3000;

/* 
 * Oauth step 1: "Users are redirected to request their GitHub identity"
 */
router.get('/auth/login', async (ctx: RouterContext) => {
  ctx.response.redirect(`https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo&allow_signup=false`);
});

/* 
 * Oauth step 2: "Users are redirected back to your site by GitHub"
 */
router.get('/auth/oauth-callback', async (ctx: RouterContext) => {
  const body: URLSearchParams = new URLSearchParams({
      client_id,
      client_secret,
      code: ctx.request.url.searchParams.get('code') || ''
  });

  await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { accept: 'application/json' },
      body
  })
  .then(res => { return res.json(); })
  .then(data => {
      ctx.cookies.set('auth', data.access_token, { httpOnly: true });
      ctx.response.redirect('http://localhost:8080/');
  })
  .catch(e => console.log(e));
});

/* 
 * Get repositories
 *
 * Note to self... use "users" URL for testing, use "orgs" URL in prod
 * Will only grab public repos unless app is authenticated by organization owner
 * Github doesn't return any meaningful messaging for blank result (i.e. couldn't find any repos for x reason)
 */
router.get('/repos', async (ctx: RouterContext) => {
  //const url = `https://api.github.com/orgs/${owner}/repos`;
  const url = 'https://api.github.com/users/${owner}/repos';

  await fetch(url, { headers: { authorization: `token ${ctx.state.token}` }})
  .then(res => { return res.json(); })
  .then(data => { return data.map((repo: any) => repo.name); })
  .then(repos => ctx.response.body = repos)
  .catch(e => console.log(e));
});

router.post('/create', async (ctx: RouterContext) => {
  const { value } = ctx.request.body();
  const branches = JSON.parse(await value);

  const urls:string[] = [];
  for (const branch of branches) {
      // Get hash of head in repo
      const sha = await fetch(`https://api.github.com/repos/${owner}/${branch.repo}/git/refs/heads`, {
        headers: {
          authorization: `token ${ctx.state.token}`,
          accept: 'application/vnd.github.v3+json'
        }
      })
      .then(res => { return res.json(); })
      .then(data => { return data[0].object.sha })
      .catch(e => console.log(e));

      // Create a new branch
      await fetch(`https://api.github.com/repos/${owner}/${branch.repo}/git/refs`, {
        method: 'POST',  
        headers: {
          authorization: `token ${ctx.state.token}`,
          accept: 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          ref: `refs/heads/${branch.name}`,
          sha,
        })
      })
      .then(res => { return res.json(); })
      .then(data => urls.push(`https://github.com/${owner}/${branch.repo}/tree/${branch.name}`))
      .catch(e => console.log(e));
  }

  // Send back an array of URLs of created branches
  ctx.response.body = urls;
});

app
  .use(async (ctx: Context, next: any) => {
    ctx.state.token = ctx.cookies.get('auth');
    await next();
    delete ctx.state.token;
  })
  .use(router.routes())
  .use(router.allowedMethods());

app.listen({ port });
console.log(`Server is running on port ${port}`);