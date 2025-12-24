const env = require("../config/env");
const { extractHashtags } = require("../utils/extractHastag");
const { ApifyClient } = require("apify-client");

const fetch = async (...args) => {
  const { default: fetchModule } = await import("node-fetch");
  return fetchModule(...args);
};

const apifyClient = new ApifyClient({
  token: env.apifyInstagramApiToken,
});

async function syncInstagramAccount(account) {
  const {
    igUserId,
    accessToken,
    username,
    profileName,
    biography,
    profilePictureUrl,
    followersCount,
    mediaCount,
  } = account;

  const mediaUrl = new URL(`https://graph.facebook.com/v24.0/${igUserId}/media`);
  mediaUrl.searchParams.set("fields", "id,caption,media_type,media_url,permalink,timestamp");
  mediaUrl.searchParams.set("limit", "50");
  mediaUrl.searchParams.set("access_token", accessToken);

  const mediaRes = await fetch(mediaUrl);
  const mediaJson = await mediaRes.json();
  if (!mediaRes.ok) throw mediaJson;

  const posts = mediaJson.data || [];

  const profile = {
    username,
    profileName,
    biography,
    profilePictureUrl,
    followersCount,
    mediaCount,
  };

  const enriched = [];

  for (const p of posts) {
    let insights = {};
    let insightsAvailable = true;        // assume true by default
    let insightsErrorMessage = null;
    const metrics = [
      "reach",
      "saved",
      "likes",
      "comments",
      "shares",
      "views",
    ];

    const insUrl = new URL(`https://graph.facebook.com/v24.0/${p.id}/insights`);
    insUrl.searchParams.set("metric", metrics.join(","));
    insUrl.searchParams.set("access_token", accessToken);

    try {
      const insRes = await fetch(insUrl);
      const insJson = await insRes.json();

      if (insRes.ok && Array.isArray(insJson.data)) {
        insJson.data.forEach(metric => {
          insights[metric.name] = {
            value: metric.values?.[0]?.value ?? null,
            period: metric.period ?? null,
          };
        });
      } else {
        insights = {
          message: "No insights available for this media"
        };
      }
    } catch (e) {
      console.error("Insights fetch failed for media", p.id, e);
    }

    enriched.push({
      ...p,
      hashtags: extractHashtags(p.caption),
      insights,
    });

    console.log(insights);
  }

  return { profile, posts: enriched };
}

async function syncAllAccounts() {
  // This function is now a no-op for DB, but we keep it to preserve API.
  return [];
}


const getUserData = async (username) => {
  const input = {
    username: [username],
    resultsLimit: 30,
  };

  const run = await apifyClient.actor("nH2AHrwxeTRJoN5hX").call(input);
  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

  return items;
};

module.exports = {
  syncInstagramAccount,
  syncAllAccounts,
  getUserData,
};
