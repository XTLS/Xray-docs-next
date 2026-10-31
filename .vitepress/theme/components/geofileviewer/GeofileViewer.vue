<script setup lang="ts">
import { ref } from "vue"

const source = ref("preset")
const sourceOpen = ref(true)
</script>

<template>
  <main class="geo-viewer">
    <header class="geo-heading">
      <p class="geo-eyebrow">PROJECT X / TOOLS</p>
      <h1>Geo 数据查看器</h1>
      <p>浏览 GeoIP 和 GeoSite 文件，查看分类、IP 网段与域名规则。</p>
    </header>

    <section class="geo-source geo-panel" aria-label="数据来源">
      <div class="geo-panel-heading">
        <h2>数据来源</h2>
        <button class="geo-text-button" @click="sourceOpen = !sourceOpen">
          {{ sourceOpen ? "收起" : "切换来源" }}
        </button>
      </div>
      <template v-if="sourceOpen">
        <div class="geo-tabs" aria-label="选择数据来源">
          <button
            v-for="tab in [
              { id: 'preset', label: '官方预设' },
              { id: 'url', label: 'URL' },
              { id: 'local', label: '本地文件' }
            ]"
            :key="tab.id"
            :aria-pressed="source === tab.id"
            @click="source = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
        <div v-if="source === 'preset'" class="geo-presets">
          <label
            v-for="(preset, index) in [
              ['GeoIP 精简版', '地区分流、私有网络和常用服务'],
              ['GeoIP 完整版', '包含全球国家和地区的 IP 数据'],
              ['GeoSite 标准版', '常用域名分类与地区黑白名单'],
              ['GeoSite 扩展版', '覆盖范围更广的地区域名数据']
            ]"
            :key="index"
            class="geo-preset"
          >
            <input type="radio" name="preset" :checked="index === 2" />
            <span
              ><strong>{{ preset[0] }}</strong
              ><small>{{ preset[1] }}</small></span
            >
          </label>
        </div>
        <div v-else-if="source === 'url'" class="geo-field">
          <label for="geo-url">文件 URL</label>
          <input
            id="geo-url"
            type="url"
            placeholder="https://example.com/geosite.dat"
          />
        </div>
        <div v-else class="geo-dropzone">
          <strong>选择或拖放本地 DAT 文件</strong>
          <p>文件在浏览器内处理。</p>
        </div>
        <div class="geo-source-actions">
          <button class="geo-button primary" disabled>加载文件</button>
          <span class="geo-muted">数据加载功能正在接入。</span>
        </div>
      </template>
    </section>

    <section class="geo-empty geo-panel">
      <span class="geo-empty-icon" aria-hidden="true">{ }</span>
      <h2>从一个数据文件开始</h2>
      <p>加载文件后，在左侧选择分类，在右侧查看条目。</p>
    </section>
  </main>
</template>

<style scoped src="./viewer.css"></style>
