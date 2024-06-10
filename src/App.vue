<template>
  <div id="app">
    <el-space alignment="center" id="title">
      <img id='logo' src="./assets/icon.png" />
      XCall
    </el-space>
    <router-view/>
  </div>
</template>
<script>

export default {
  name: 'App',
  components: {
  },
}
</script>

<style>
#app {
  font-family: 'Oswald', 'Arial', sans-serif;
}
#title {
  font-size: 18px;
}
#logo {
  margin-left: 16px;
  width: 40px;
  height: 40px;
}

</style>
