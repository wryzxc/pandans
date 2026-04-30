<script setup lang="ts">
import { ref, computed } from 'vue'

interface ChapterItem {
  title: string
  description: string
  code: string
  keyPoints: string[]
}

const props = defineProps<{
  chapters: ChapterItem[]
}>()

const emit = defineEmits<{
  runDemo: [code: string]
  loadCode: [code: string]
}>()

const expandedIndex = ref<number | null>(0)
const copiedIndex = ref<number | null>(null)

const hasChapters = computed(() => props.chapters && props.chapters.length > 0)

function toggleExpand(index: number) {
  expandedIndex.value = expandedIndex.value === index ? null : index
}

function isExpanded(index: number) {
  return expandedIndex.value === index
}

async function copyCode(code: string, index: number) {
  try {
    await navigator.clipboard.writeText(code)
    copiedIndex.value = index
    setTimeout(() => {
      copiedIndex.value = null
    }, 2000)
  } catch {
    // Fallback: select text for manual copy
    const textarea = document.createElement('textarea')
    textarea.value = code
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copiedIndex.value = index
    setTimeout(() => {
      copiedIndex.value = null
    }, 2000)
  }
}

function runDemo(code: string) {
  emit('runDemo', code)
}

function loadCode(code: string) {
  emit('loadCode', code)
}

function getCodeLines(code: string): string[] {
  return code.split('\n')
}
</script>

<template>
  <div class="chapter-learning">
    <div class="chapter-header">
      <span class="chapter-icon">📖</span>
      <span class="chapter-title">章节学习</span>
      <span v-if="hasChapters" class="chapter-count">{{ chapters.length }} 个示例</span>
    </div>

    <div v-if="!hasChapters" class="chapter-empty">
      <p>暂无章节学习示例</p>
    </div>

    <div v-else class="chapter-list">
      <div
        v-for="(chapter, index) in chapters"
        :key="index"
        class="chapter-item"
        :class="{ 'chapter-expanded': isExpanded(index) }"
      >
        <div class="chapter-item-header" @click="toggleExpand(index)">
          <div class="chapter-item-title">
            <span class="expand-icon">{{ isExpanded(index) ? '▼' : '▶' }}</span>
            <span class="title-text">{{ chapter.title }}</span>
          </div>
          <div class="chapter-item-actions">
            <button
              class="action-btn"
              :class="{ 'copied': copiedIndex === index }"
              @click.stop="copyCode(chapter.code, index)"
              title="复制代码"
            >
              {{ copiedIndex === index ? '✅ 已复制' : '📋 复制' }}
            </button>
            <button
              class="action-btn run-btn"
              @click.stop="runDemo(chapter.code)"
              title="运行演示"
            >
              ▶ 运行
            </button>
          </div>
        </div>

        <div v-if="isExpanded(index)" class="chapter-item-body">
          <p class="chapter-description">{{ chapter.description }}</p>

          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Python</span>
              <button class="code-action" @click="loadCode(chapter.code)" title="加载到编辑器">
                ✏️ 加载到编辑器
              </button>
            </div>
            <pre class="code-content"><code><div v-for="(line, lineIdx) in getCodeLines(chapter.code)" :key="lineIdx" class="code-line"><span class="line-number">{{ lineIdx + 1 }}</span><span class="line-content">{{ line || ' ' }}</span></div></code></pre>
          </div>

          <div v-if="chapter.keyPoints && chapter.keyPoints.length" class="key-points">
            <div class="key-points-title">💡 核心要点</div>
            <ul class="key-points-list">
              <li v-for="(point, pIdx) in chapter.keyPoints" :key="pIdx">{{ point }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chapter-learning {
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.chapter-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.chapter-icon {
  font-size: 16px;
}

.chapter-title {
  flex: 1;
}

.chapter-count {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 400;
  background: var(--bg-card);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.chapter-empty {
  padding: 32px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

.chapter-list {
  display: flex;
  flex-direction: column;
}

.chapter-item {
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s ease;
}

.chapter-item:last-child {
  border-bottom: none;
}

.chapter-item:hover {
  background: var(--bg-tertiary);
}

.chapter-expanded {
  background: var(--bg-card);
}

.chapter-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
}

.chapter-item-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.expand-icon {
  font-size: 10px;
  color: var(--text-muted);
  flex-shrink: 0;
  width: 14px;
  text-align: center;
}

.title-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chapter-item-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  padding: 4px 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-blue);
  color: var(--accent-blue);
}

.action-btn.copied {
  background: rgba(74, 222, 128, 0.15);
  border-color: #4ade80;
  color: #4ade80;
}

.run-btn {
  background: rgba(59, 130, 246, 0.1);
  border-color: var(--accent-blue);
  color: var(--accent-blue);
}

.run-btn:hover {
  background: var(--accent-blue);
  color: white;
}

.chapter-item-body {
  padding: 0 16px 16px 38px;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chapter-description {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
  padding-right: 16px;
}

.code-block {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: 12px;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.code-lang {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.code-action {
  padding: 2px 8px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--accent-blue);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.code-action:hover {
  background: rgba(59, 130, 246, 0.1);
}

.code-content {
  margin: 0;
  padding: 12px 0;
  background: var(--bg-primary);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.6;
}

.code-line {
  display: flex;
  padding: 0 12px;
}

.code-line:hover {
  background: var(--bg-tertiary);
}

.line-number {
  display: inline-block;
  width: 28px;
  text-align: right;
  color: var(--text-muted);
  font-size: 11px;
  flex-shrink: 0;
  user-select: none;
  margin-right: 12px;
}

.line-content {
  color: var(--text-primary);
  white-space: pre;
  word-break: break-all;
}

.key-points {
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
}

.key-points-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.key-points-list {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.key-points-list li {
  margin-bottom: 2px;
}

.key-points-list li::marker {
  color: var(--accent-blue);
}
</style>
