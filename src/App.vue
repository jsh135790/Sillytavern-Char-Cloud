<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <!-- 赛博朋克背景 -->
  <div class="cyberpunk-bg"></div>
  
  <!-- 导航栏 -->
  <NavBar />
  
  <!-- 主要内容 -->
  <main class="main-content">
    <RouterView />
  </main>
</template>

<style scoped>
.main-content {
  min-height: 100vh;
  /* padding-top: 70px; 为固定导航栏预留空间 */
}

@media (max-width: 480px) {
  .main-content {
    padding-top: 60px;
  }
}
</style>
