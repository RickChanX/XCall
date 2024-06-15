<template>
  <div id="app">
    <div id='header'>
      <router-link replace to="/" id="topLeft">
        <img id='logo' src="./assets/icon.png" />
        <span id='title'>XCall</span>
      </router-link>
      <div id='topright'>
        <a href="https://github.com/RickChanX/XCall" target="_blank" id="github">
          <img id='github' src="./assets/github.png" />
        </a>
      </div>
    </div>
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
#logo {
  margin-left: 16px;
  width: 40px;
  height: 40px;
}
#title {
  font-size: 26px;
  vertical-align: top;
  display: inline-block;
  margin-left: 4px;
  margin-top: 6px;
  color: black;
}
#topright {
  float: right;
  margin-right:60px;
}
#github {
  width: 32px;
  height: 32px;
  margin-top: 4px;
}
</style>
