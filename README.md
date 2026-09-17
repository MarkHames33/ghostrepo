# Edgardo Law Office — Ghost CMS Theme

Custom theme para sa Ghost CMS, gawa para sa Edgardo Law Office. Ito yung theme
lang — kailangan mo munang i-install si Ghost mismo sa localhost mo (hindi ito
kasama sa zip kasi malaki ang Ghost installer at kailangan i-download galing sa
npm), tapos ilalagay mo itong theme sa loob ng install na yun.

## Bahagi 1 — I-install si Ghost sa localhost

### Kailangan mo muna:
- **Node.js v22 LTS** (ito ang required version ng Ghost ngayon — huwag gumamit
  ng mas bago o mas luma). Puwede i-download sa https://nodejs.org
- **npm** (kasama na sa Node.js install)

### Hakbang-hakbang:

1. I-verify na tama ang Node version mo:
   ```bash
   node -v
   ```
   Dapat lumabas `v22.x.x`.

2. I-install ang Ghost-CLI (isang beses lang ito, globally):
   ```bash
   npm install ghost-cli@latest -g
   ```

3. Gumawa ng **bagong, walang lamang folder** (halimbawa `edgardo-cms`) at
   pumunta doon:
   ```bash
   mkdir edgardo-cms
   cd edgardo-cms
   ```

4. I-install si Ghost sa loob ng folder na ito:
   ```bash
   ghost install local
   ```
   Aabutin ito ng ilang minuto (nagda-download ng packages). Kapag tapos na,
   automatic siyang tatakbo.

5. Buksan sa browser:
   - **Public website:** http://localhost:2368
   - **Ghost Admin (CMS panel):** http://localhost:2368/ghost
     (dito ka gagawa ng admin account sa unang pagkakataon)

Para i-stop/i-start ulit si Ghost:
```bash
ghost stop
ghost start
```

## Bahagi 2 — I-install ang Edgardo Law Office theme

1. Sa loob ng `edgardo-cms` folder na ginawa mo (ang parehong folder kung saan
   mo tinakbo ang `ghost install local`), hanapin ang:
   ```
   content/themes/
   ```

2. Kopyahin ang buong `edgardo-law` folder (mula sa zip na ito) papunta sa
   loob ng `content/themes/`. Dapat maging ganito ang path:
   ```
   edgardo-cms/content/themes/edgardo-law/
   ```

3. I-restart si Ghost para makita ang bagong theme:
   ```bash
   ghost restart
   ```

4. Pumunta sa Ghost Admin (`http://localhost:2368/ghost`) →
   **Settings → Design and theme** → hanapin ang **"Edgardo Law"** sa listahan
   ng naka-install na themes → **Activate**.

## Bahagi 3 — Pag-a-add ng content (dito ka na "mag-a-add ng info")

Ang Ghost ay gumagamit ng **Posts**, **Pages**, at **Tags** — kaya ganito ang
mapping para sa website:

### Office Info (address, phone, office hours, headline)
Sa Ghost Admin → **Settings → Design and theme → Edgardo Law → Customize** —
may makikita kang mga custom field:
- Office Address
- Office Phone
- Office Hours
- Hero Headline

I-edit lang ang mga yun at **Save**. Awtomatiko itong lalabas sa site.

Para sa **Office Name / Description** (ginagamit sa `<title>` at hero
subtext), pumunta sa **Settings → General** at i-edit ang **Site title** at
**Site description**.

### About Section
1. Sa Admin, gumawa ng bagong **Page** (hindi Post).
2. Title: `About`
3. Siguraduhing ang **URL slug** ay `about` (makikita sa ilalim ng title kapag
   in-edit mo, o sa "Post settings" panel).
4. Isulat ang about text ng law office sa body.
5. I-publish.

### Practice Areas / Services
Para sa **bawat service** (hal. Civil Litigation, Family Law, atbp.):
1. Gumawa ng bagong **Post**.
2. Title = pangalan ng service (hal. "Family Law")
3. Sa **Post settings** (⚙ icon sa kanan), ilagay ang maikling paglalarawan sa
   **Custom excerpt** field.
4. Sa ibaba ng title, i-type ang `#service` bilang tag (ang `#` sa harap ay
   ginagawa itong "internal tag" — hindi ito makikita ng publiko bilang tag
   page, pang-organize lang siya).
5. I-publish.

### Attorneys
Para sa **bawat abogado**:
1. Gumawa ng bagong Post.
2. Title = buong pangalan ng abogado.
3. Custom excerpt = position/title (hal. "Managing Partner")
4. Feature image = larawan ng abogado (optional — kung wala, may lalabas na
   monogram na initials na lang)
5. Body = bio ng abogado.
6. Tag = `#attorney`
7. I-publish.

### Client Testimonials
Para sa **bawat testimonial**:
1. Gumawa ng bagong Post.
2. Title = pangalan ng client.
3. Body/excerpt = ang testimonial text mismo.
4. Tag = `#testimonial`
5. I-publish.

(Isang testimonial lang ang ipinapakita sa homepage — ang pinakabago.)

### Contact Page (optional, hiwalay sa homepage Contact section)
Pwede kang gumawa ng Page na `Contact` kung gusto mo ng standalone contact
page bukod sa Contact section na nasa homepage na.

## Structure ng theme folder

```
edgardo-law/
├── package.json          ← theme config + custom settings definitions
├── default.hbs           ← base layout (header, nav, footer)
├── index.hbs             ← homepage (hero, about, services, attorneys, atbp.)
├── page.hbs              ← template ng static Pages
├── post.hbs               ← fallback kapag binuksan nang direkta ang isang post
└── assets/
    ├── css/screen.css     ← buong design/styling
    └── js/main.js         ← mobile menu toggle lang
```

## Troubleshooting

- **"Theme not found" o hindi lumalabas sa listahan** — siguraduhing tama ang
  path: `content/themes/edgardo-law/package.json` dapat mabasa, hindi
  `content/themes/edgardo-law/edgardo-law/package.json` (i.e. huwag
  ma-double-nest ang folder).
- **Walang lumalabas sa Services/Attorneys/Testimonials** — siguraduhing
  na-publish mo (hindi naka-draft lang) ang mga Post, at tama ang tag
  (`#service`, `#attorney`, `#testimonial` — kasama ang `#`).
- **Node version error** habang `ghost install local`** — i-check ulit kung
  Node v22 talaga ang installed (`node -v`). Kung mali, i-download ang
  tamang version sa nodejs.org.

## Render deployment

The repository includes an isolated Docker deployment for Render. It does not
change the local Ghost setup or the development SQLite database.

### Before deploying

- Create a managed **MySQL 8** database. Ghost production does not use Render
   PostgreSQL as its application database.
- Create a Render Web Service from this repository and choose Docker.
- Use the included `render.yaml` as the service blueprint, or copy its
   environment variables into the Render dashboard.
- Set `url` to the final public HTTPS URL of the Render service.
- Add the MySQL host, port, database name, username, and password as secret
   environment variables.
- Add SMTP credentials if the site will send staff or member emails.

The Render service uses a persistent disk for Ghost content and seeds it from
the repository on first boot. The local `config.development.json`, SQLite
database, backups, logs, and `node_modules` are not used by this deployment.
