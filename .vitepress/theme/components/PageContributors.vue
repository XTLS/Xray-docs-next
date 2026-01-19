<script setup lang="ts">
import contributorsMap from "../../.generated/contributors.json";
import { useRoute, useData } from "vitepress";
import { computed } from "vue";

type Contributor = { name: string; email?: string; commits: number };

const route = useRoute();
const { lang } = useData();

const list = computed(() => {
  const map = contributorsMap as Record<string, Contributor[]>;

  const raw = route.path;

  const candidates = new Set<string>();

  const noHtml = raw.replace(/\.html$/, "");
  candidates.add(raw);
  candidates.add(noHtml);

  // /foo -> /foo/ and /foo/ -> /foo
  for (const p of [raw, noHtml]) {
    if (p.endsWith("/")) candidates.add(p.slice(0, -1));
    else candidates.add(p + "/");
  }

  for (const key of candidates) {
    if (map[key]?.length) return map[key];
  }
  return [];
});

const t = computed(() => {
  const l = (lang.value || "en").toLowerCase();
  const dict = {
    en: { contributors: "Contributors", commits: "commits" },
    zh: { contributors: "贡献者", commits: "次提交" },
    ru: { contributors: "Участники", commits: "коммитов" },
  } as const;
  return (dict as any)[l] || (dict as any)[l.split("-")[0]] || dict.en;
});
</script>

<template>
  <details open v-if="list.length" class="vp-contributors">
    <summary class="summary">
      {{ t.contributors }}
      <span class="count">({{ list.length }})</span>
    </summary>

    <ul class="list">
      <li v-for="c in list" :key="c.email || c.name" class="item">
        <img class="avatar" :src="c.avatarUrl" :alt="c.name" loading="lazy" />
        <div class="main">
          <div class="row">
            <span class="name">{{ c.name }}</span>
            <span class="meta">· {{ c.commits }} {{ t.commits }}</span>
          </div>

          <div class="sub">
            <a
              v-if="c.email && !c.github"
              class="link"
              :href="`mailto:${c.email}`"
            >
              {{ c.email }}
            </a>
            <a
              v-if="c.github"
              class="link"
              :href="`https://github.com/${c.github}`"
              target="_blank"
              rel="noreferrer"
            >
              @{{ c.github }}
            </a>
          </div>
        </div>
      </li>
    </ul>
  </details>
</template>

<style scoped>
.vp-contributors {
  margin-top: 28px;
  padding-top: 12px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 12px;
  opacity: 0.75;
}

.summary {
  cursor: pointer;
  user-select: none;
  font-weight: 500;
  list-style: none;
}

.summary::-webkit-details-marker {
  display: none;
}

.count {
  opacity: 0.7;
  margin-left: 4px;
}

.list {
  margin: 10px 0 0;
  padding-left: 18px;
}

.name {
  font-weight: 500;
}

.meta {
  opacity: 0.7;
  margin-left: 6px;
}

.item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin: 6px 0;
}
.avatar {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  opacity: 0.9;
}
.main {
  min-width: 0;
}
.row {
  display: flex;
  gap: 6px;
  align-items: baseline;
  flex-wrap: wrap;
}
.sub {
  opacity: 0.75;
  font-size: 11px;
  line-height: 1.2;
}
.link {
  color: var(--vp-c-text-2);
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
.sep {
  margin: 0 6px;
  opacity: 0.6;
}
</style>
