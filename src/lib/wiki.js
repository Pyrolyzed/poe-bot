const https = require("https");
const crypto = require("crypto");
const cheerio = require("cheerio");
const { AttachmentBuilder, EmbedBuilder, escapeMarkdown } = require("discord.js");

const get = (url) => {
  return new Promise((resolve, reject) => {
    let data = "";

    https.get(url, response => {
      response.on("data", chunk => {
        data += chunk;
      });

      response.on("end", () => {
        resolve(data);
      });

      response.on("error", err => {
        reject(err);
      });
    }).on("error", err => {
      reject(err);
    });
  });
}

const api = async (url, params) => {
  const query = new URLSearchParams({ format: "json", formatversion: "2", ...params });
  return JSON.parse(await get(`${url}?${query.toString()}`));
};

const siteRoot = (url) => url.replace("/w/api.php", "");
const pageUrl = (url, title) => `${siteRoot(url)}/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`;

const getPage = async (page, url) => {
  const searchData = await api(url, { action: "query", list: "search", srsearch: page });

  const results = searchData.query.search;
  if (!results || results.length === 0) {
    return null;
  }

  const resolveData = await api(url, { action: "query", titles: results[0].title, redirects: "1" });
  const title = resolveData.query.pages[0].title;

  return { title, url: pageUrl(url, title) };
};

// MediaWiki stores uploads at /images/<h>/<hh>/<name>, where hh is the start of md5(name).
const fileUrl = (url, file) => {
  let name = file.replace(/^File:/, "").replaceAll(" ", "_");
  name = name.charAt(0).toUpperCase() + name.slice(1);
  const hash = crypto.createHash("md5").update(name).digest("hex");
  return `${siteRoot(url)}/images/${hash[0]}/${hash.slice(0, 2)}/${encodeURIComponent(name)}`;
};

// First paragraph(s) of the page intro, without item hover popups or citation markers.
const getSummary = async (title, url) => {
  const data = await api(url, { action: "parse", page: title, prop: "text", section: "0", disablelimitreport: "1" });
  if (!data.parse) return null;

  const $ = cheerio.load(data.parse.text);
  $(".hoverbox__display, .c-item-hoverbox__display, sup.reference, .mw-editsection, style").remove();

  let summary = "";
  for (const p of $(".mw-parser-output > p").toArray()) {
    const text = $(p).text().replace(/\s+/g, " ").trim();
    if (!text) continue;
    if (summary && summary.length + text.length > 600) break;
    summary += (summary ? "\n\n" : "") + text;
    if (summary.length > 300) break;
  }
  if (summary.length > 1000) summary = summary.slice(0, 997).replace(/\s+\S*$/, "") + "…";
  return summary || null;
};

const getItem = async (title, url) => {
  const data = await api(url, {
    action: "cargoquery",
    tables: "items",
    fields: "items._pageName=page,name,inventory_icon,html",
    where: `items._pageName="${title.replaceAll("\"", "\\\"")}"`,
    limit: "20",
  });
  const rows = (data.cargoquery || []).map(r => r.title).filter(r => r.html);
  return rows.find(r => r.name === title) || rows[0] || null;
};

// Tooltip border colours from the wiki's item-box classes.
const ITEM_COLOURS = {
  normal: 0xc8c8c8,
  magic: 0x8888ff,
  rare: 0xffff77,
  unique: 0xaf6025,
  gem: 0x1ba29b,
  currency: 0xaa9e82,
  divicard: 0x0ebaff,
  quest: 0x4ae63a,
  prophecy: 0xb54bff,
  relic: 0x82ad6a,
};
const DEFAULT_COLOUR = 0x2b2d31;

// The Cargo html still holds raw [[links]] and [[File:...]] embeds.
const stripWikitext = (text) => text
  .replace(/\[\[File:[^\]]*\]\]/gi, "")
  .replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, "$1");

// Converts one tooltip group of the Cargo item html into Discord markdown.
const groupToMarkdown = ($, group) => {
  const el = $(group).clone();
  el.find("br").replaceWith("\n");
  el.find("big").each((_, big) => {
    const text = $(big).text().trim();
    $(big).replaceWith(text ? `\uE000${text}\uE000` : "");
  });

  const text = stripWikitext(el.text())
    .split("\n")
    .map(line => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!text) return "";

  const md = escapeMarkdown(text).replace(/\uE000(.*?)\uE000/g, "**$1**");
  const cls = $(group).attr("class") || "";
  if (/-flavour/.test(cls)) return md.split("\n").map(l => l && `*${l}*`).join("\n");
  if (/-help/.test(cls)) return md.split("\n").map(l => l && `-# ${l}`).join("\n");
  return md;
};

const DIVIDER = "\n────────────\n";

const buildItemEmbed = (item, url, link) => {
  // Cargo returns the html entity-escaped, so decode it once before parsing.
  const html = cheerio.load(item.html, null, false).text();
  const $ = cheerio.load(html, null, false);
  const box = $(".item-box").first();
  const type = ((box.attr("class") || "").match(/(?:^|\s)-(\w+)/) || [])[1];
  if (type === "divicard") return buildDivCardEmbed($, item, url, link);

  const header = $(".header").first().clone();
  header.find("br").replaceWith("\n");
  const [name, ...baseLines] = header.text().split("\n").map(s => s.trim()).filter(Boolean);

  const groups = $(".item-stats > .group").toArray().map(g => groupToMarkdown($, g)).filter(Boolean);
  if (baseLines.length) groups.unshift(baseLines.map(l => `**${escapeMarkdown(l)}**`).join("\n"));

  let description = "";
  for (const group of groups) {
    const next = description ? description + DIVIDER + group : group;
    if (next.length > 4000) {
      description += "\n…";
      break;
    }
    description = next;
  }

  const embed = new EmbedBuilder()
    .setTitle(name || item.name)
    .setURL(link)
    .setColor(ITEM_COLOURS[type] ?? DEFAULT_COLOUR);
  if (description) embed.setDescription(description);
  if (item["inventory icon"]) embed.setThumbnail(fileUrl(url, item["inventory icon"]));
  return embed;
};

const buildDivCardEmbed = ($, item, url, link) => {
  $(".hoverbox__display").remove();
  const field = (cls) => stripWikitext($(cls).first().text()).replace(/\s+/g, " ").trim();
  const stack = field(".divicard-stack");
  const reward = field(".divicard-reward");
  const flavour = field(".divicard-flavour");

  const groups = [];
  if (stack) groups.push(`Stack Size: ${stack}`);
  if (reward) groups.push(`**${escapeMarkdown(reward)}**`);
  if (flavour) groups.push(`*${escapeMarkdown(flavour)}*`);

  const embed = new EmbedBuilder()
    .setTitle(field(".divicard-header") || item.name)
    .setURL(link)
    .setColor(ITEM_COLOURS.divicard);
  if (groups.length) embed.setDescription(groups.join(DIVIDER));

  const art = ($(".divicard-art").text().match(/\[\[(File:[^|\]]+)/) || [])[1];
  if (art) embed.setThumbnail(fileUrl(url, art.trim()));
  else if (item["inventory icon"]) embed.setThumbnail(fileUrl(url, item["inventory icon"]));
  return embed;
};

const getImage = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      if (response.statusCode !== 200 || !/^image\//.test(response.headers["content-type"] || "")) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      response.on("data", chunk => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", reject);
    }).on("error", reject);
  });
};

// Discord's image proxy gets a Cloudflare challenge from poewiki.net, so wiki images are
// downloaded here and sent as an attachment. Returns a message payload for reply().
const getPageMessage = async (page, url) => {
  const embed = await getPageEmbed(page, url);
  const files = [];

  const thumbnail = embed.data.thumbnail?.url;
  if (thumbnail) {
    try {
      const name = `thumbnail${(thumbnail.match(/\.(png|jpe?g|gif|webp)$/i) || [".png"])[0].toLowerCase()}`;
      files.push(new AttachmentBuilder(await getImage(thumbnail), { name }));
      embed.setThumbnail(`attachment://${name}`);
    } catch (error) {
      console.error(`Wiki thumbnail download failed for ${page.title}:`, error.message);
      embed.setThumbnail(null);
    }
  }

  return { embeds: [embed], files };
};

// Embed for a wiki page: the item tooltip for items and gems, otherwise the intro summary.
const getPageEmbed = async (page, url) => {
  const [item, summary] = await Promise.all([
    getItem(page.title, url).catch(() => null),
    getSummary(page.title, url).catch(() => null),
  ]);

  if (item) {
    try {
      return buildItemEmbed(item, url, page.url);
    } catch (error) {
      console.error(`Failed to build item embed for ${page.title}:`, error);
    }
  }

  const embed = new EmbedBuilder().setTitle(page.title).setURL(page.url).setColor(DEFAULT_COLOUR);
  if (summary) embed.setDescription(summary);
  return embed;
};

module.exports = { get, getPage, getPageEmbed, getPageMessage }
