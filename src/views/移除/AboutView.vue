<script setup>
import { useLanguage } from '../composables/useLanguage'

const { t } = useLanguage()
</script>

<template>
  <div class="space-y-12">
    <!-- 个人介绍区域 -->
    <section class="text-center py-16">
      <div class="mb-8">
        <div class="w-32 h-32 mx-auto bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/25">
          <font-awesome-icon icon="fas fa-user" class="text-4xl text-white" />
        </div>
        <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          关于开发者
        </h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">
          一个热爱前端技术的开发者，专注于创造美观和实用的用户界面
        </p>
      </div>
    </section>

    <!-- 技能展示 -->
    <section class="bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
      <h2 class="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        技能专长
      </h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="skill-card">
          <div class="skill-icon bg-gradient-to-r from-blue-500 to-cyan-500">
            <font-awesome-icon icon="fas fa-code" class="text-2xl text-white" />
          </div>
          <h3 class="text-xl font-semibold text-cyan-400 mb-2">前端开发</h3>
          <p class="text-gray-300 text-sm">Vue.js, React, JavaScript, TypeScript</p>
          <div class="skill-bar">
            <div class="skill-progress bg-gradient-to-r from-blue-500 to-cyan-500" style="width: 90%"></div>
          </div>
        </div>

        <div class="skill-card">
          <div class="skill-icon bg-gradient-to-r from-purple-500 to-pink-500">
            <font-awesome-icon icon="fas fa-palette" class="text-2xl text-white" />
          </div>
          <h3 class="text-xl font-semibold text-purple-400 mb-2">UI/UX 设计</h3>
          <p class="text-gray-300 text-sm">Tailwind CSS, SCSS, 响应式设计</p>
          <div class="skill-bar">
            <div class="skill-progress bg-gradient-to-r from-purple-500 to-pink-500" style="width: 85%"></div>
          </div>
        </div>

        <div class="skill-card">
          <div class="skill-icon bg-gradient-to-r from-green-500 to-yellow-500">
            <font-awesome-icon icon="fas fa-rocket" class="text-2xl text-white" />
          </div>
          <h3 class="text-xl font-semibold text-green-400 mb-2">工程化</h3>
          <p class="text-gray-300 text-sm">Vite, Webpack, Git, CI/CD</p>
          <div class="skill-bar">
            <div class="skill-progress bg-gradient-to-r from-green-500 to-yellow-500" style="width: 80%"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 项目经验 -->
    <section>
      <h2 class="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
        项目经验
      </h2>
      <div class="space-y-6">
        <div class="project-card">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <font-awesome-icon icon="fas fa-code" class="text-xl text-white" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-cyan-400 mb-2">赛博朋克主题网站</h3>
              <p class="text-gray-300 mb-3">
                基于 Vue 3 和 Tailwind CSS 构建的现代化网站，具有动态背景效果和流畅的交互体验。
                采用组件化开发模式，支持主题切换和国际化功能。
              </p>
              <div class="flex flex-wrap gap-2">
                <span class="tech-tag">Vue 3</span>
                <span class="tech-tag">Tailwind CSS</span>
                <span class="tech-tag">Vite</span>
                <span class="tech-tag">Pinia</span>
              </div>
            </div>
          </div>
        </div>

        <div class="project-card">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <font-awesome-icon icon="fas fa-palette" class="text-xl text-white" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-purple-400 mb-2">组件库系统</h3>
              <p class="text-gray-300 mb-3">
                开发了一套可复用的 UI 组件库，包含常用的表单、导航、数据展示等组件。
                具有完善的文档和示例，支持主题定制和响应式设计。
              </p>
              <div class="flex flex-wrap gap-2">
                <span class="tech-tag">TypeScript</span>
                <span class="tech-tag">Storybook</span>
                <span class="tech-tag">SCSS</span>
                <span class="tech-tag">Jest</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系方式 -->
    <section class="text-center py-12 bg-gray-900/20 backdrop-blur-sm border border-gray-700 rounded-xl">
      <h2 class="text-2xl font-bold mb-6 text-white">联系我</h2>
      <div class="flex justify-center space-x-6">
        <a href="#" class="contact-link">
          <font-awesome-icon icon="fab fa-github" class="text-2xl" />
          <span>GitHub</span>
        </a>
        <a href="#" class="contact-link">
          <font-awesome-icon icon="fab fa-discord" class="text-2xl" />
          <span>Discord</span>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
@import "tailwindcss";
.skill-card {
  @apply bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all duration-300;
}

.skill-icon {
  @apply w-12 h-12 rounded-lg flex items-center justify-center mb-4;
}

.skill-bar {
  @apply w-full h-2 bg-gray-700 rounded-full mt-3 overflow-hidden;
}

.skill-progress {
  @apply h-full rounded-full transition-all duration-1000;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

.project-card {
  @apply bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all duration-300;
}

.tech-tag {
  @apply px-3 py-1 bg-gray-700 text-cyan-400 text-sm rounded-full border border-cyan-500/30;
}

.contact-link {
  @apply flex flex-col items-center space-y-2 text-gray-400 hover:text-cyan-400 transition-colors duration-300 p-4 rounded-lg hover:bg-gray-800/50;
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
  50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.4); }
}

.skill-progress {
  animation: glow 2s ease-in-out infinite alternate;
}
</style>
