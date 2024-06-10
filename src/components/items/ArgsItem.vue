<template>
  <div class="item">
    <div v-for="index of argList.length" :key="index-1" class="arg">
      <div>{{ argList[index-1].name }}:</div>
      <ASTItem :ref='"arg"+(index-1)' :varAstType="argList[index-1].astType" :bBorder='innerBorder(index-1)'></ASTItem>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArgsItem',
  components: {
  },
  props: ['argList'],
  methods: {
    innerBorder(index) {
      const astType = this.argList[index].astType
      if (typeof(astType) == 'object' && astType['combType'] != null) {
        return true
      }
      return false
    },
    getArgList() {
      let argList = []
      let errMsg = null
      for (let i = 0; i < this.argList.length; i++) {
        let argItem = this.$refs["arg" + i][0]
        const [innerResultCv, innerErrMsg] = argItem.getCvValue()
        if (!innerErrMsg) {
          argList.push(innerResultCv)
        } else {
          errMsg = innerErrMsg
          break
        }
      }
      return [argList, errMsg]
    },
  },
  data() {
    return {
    }
  },
}
</script>

<style scoped>
.arg {
  margin: 10px auto;
}
</style>
