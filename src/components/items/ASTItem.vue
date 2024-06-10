<template>
  <fieldset :class='{fsBorder: bBorder, fsNoBorder : !bBorder}' :style='{width: getW + "px"}'>
    <legend v-if='varName != null && varName.length > 0'>
      {{ varName }}:
    </legend>
    <!-- Atom -->
    <div v-if='isAtom'>
      <el-input style="max-width: 500px;" size="small" clearable :placeholder="varAstType" v-model="inputValue"></el-input>
    </div>
    <!-- Optional -->
    <div v-else-if='isOptional'>
      <el-radio-group v-model="optSwitch" class="optRadio">
        <el-radio :label="1">some</el-radio>
        <el-radio :label="0">none</el-radio>
      </el-radio-group>
      <ASTItem :ref='"optional"' v-if='optSwitch=="1"' :varAstType="varAstType.astType" :bBorder='innerBorder(varAstType.astType)' :w="getW-20"></ASTItem>
    </div>
    <!-- List -->
    <div v-else-if='isList'>
      <div class="listItem" v-for="index of listCount" :key="index-1">
        <span>{{ index }}:</span>
        <div class="listItemAst">
          <ASTItem :ref='"listItem"+(index-1)' :varAstType="varAstType.astType" :bBorder='innerBorder(varAstType.astType)' :w="getW-40"></ASTItem>
        </div>
      </div>
      <div class="listBtns">
        <el-button type="primary" plain size="small"  @click="onClickAdd(1)">Add list item</el-button>
        <el-button :disabled="listCount<=0" type="primary" plain size="small"  @click="onClickAdd(-1)">Remove last</el-button>
        <!-- <el-button type="primary" plain size="small"  @click="onClickBulkAdd()">Add by split</el-button> -->
        <!-- <el-button type="info" plain size="small"  @click="onClickRemoveEmpty">Remove empty</el-button> -->
        <el-button type="info" plain size="small"  @click="onClickRemoveAll">Remove all</el-button>
      </div>
    </div>
    <!-- Tuple -->
    <div v-else-if='isTuple'>
      <div v-for="index of varAstType.fields.length" :key="index-1" class="tupleItem">
        <ASTItem :ref='"tupleItem"+(index-1)' :varName="varAstType.fields[index-1].name" :varAstType="varAstType.fields[index-1].astType" :bBorder='innerBorder(varAstType.fields[index-1].astType)' :w="getW-20"></ASTItem>
      </div>
    </div>
    <div v-else>
      Unknown ast type: {{ varName }} : {{ varAstType }}
    </div>
  </fieldset>
</template>

<script>
import { ClarityType, hexToCV, noneCV, cvToValue, bufferCVFromString, bufferCV, stringAsciiCV, stringUtf8CV, tupleCV, intCV, uintCV, trueCV, falseCV, someCV, listCV, standardPrincipalCV, contractPrincipalCV } from '@stacks/transactions'

export default {
  name: 'ASTItem',
  props: ['varName', 'varAstType', 'bBorder', 'w'],
  methods: {
    getCvValue() {
      let content = this.inputValue.toString().trim()
      let resultCv = null
      let errMsg = null
      if (this.isAtom) {
        try {
          if (content.length == 0 && this.varAstType.indexOf('buffer ') == -1 && this.varAstType.indexOf('string') == -1) {
            errMsg = 'Please input value'
          } else if (this.varAstType == 'int') {
            resultCv = intCV(content)
          } else if (this.varAstType == 'uint') {
            if (content.substr(0, 1) == 'u') {
              resultCv = uintCV(content.substr(1))
            } else if (content.substr(0, 1) == '-') {
              errMsg = `error: uint can't be negative, current is ${content}`
            } else {
              resultCv = uintCV(content)
            }
          } else if (this.varAstType == 'bool') {
            if (content=='0' || content=='false') {
              resultCv = falseCV()
            } else if (content=='1' || content=='true') {
              resultCv = trueCV()
            } else {
              errMsg = `err: ${content} cannot be converted to trueCv/falseCv`
            }
          } else if  (this.varAstType == 'principal' || this.varAstType == 'trait_reference') {
            if (content.substr(0, 1) == "'") {
              content = content.substr(1)
            }
            const parts = content.split('.')
            if (parts.length == 1) {
              resultCv = standardPrincipalCV(parts[0])
            } else if (parts.length == 2) {
              resultCv = contractPrincipalCV(parts[0], parts[1])
            }
          } else if (this.varAstType.indexOf('buffer ') != -1) {
            const startIndex = this.varAstType.indexOf(' ')
            const endIndex = this.varAstType.indexOf(')')
            if (startIndex != -1 && endIndex != -1) {
              let maxLenStr = this.varAstType.substring(startIndex+1, endIndex)
              const maxLen = parseInt(maxLenStr)
              const realContent = content.substr(0, 2) == '0x' ? content.substr(2) : content
              if (realContent.length <= 2 * maxLen) {
                resultCv = bufferCV(Buffer.from(realContent, 'hex'))
              } else {
                errMsg = `err: ${content} too long(exceed ${maxLen})`
              }
            }
          } else if (this.varAstType.indexOf('string-ascii ') != -1)  {
            const startIndex = this.varAstType.indexOf(' ')
            const endIndex = this.varAstType.indexOf(')')
            if (startIndex != -1 && endIndex != -1) {
              let maxLenStr = this.varAstType.substring(startIndex+1, endIndex)
              const maxLen = parseInt(maxLenStr)
              if (content.length <= maxLen) {
                resultCv = stringAsciiCV(content)
              } else {
                errMsg = `err: ${content} too long(exceed ${maxLen})`
              }
            }
          } else if (this.varAstType.indexOf('string-utf8 ') != -1)  {
            const startIndex = this.varAstType.indexOf(' ')
            const endIndex = this.varAstType.indexOf(')')
            if (startIndex != -1 && endIndex != -1) {
              let maxLenStr = this.varAstType.substring(startIndex+1, endIndex)
              const maxLen = parseInt(maxLenStr)
              if (content.length <= maxLen) {
                resultCv = stringUtf8CV(content)
              } else {
                errMsg = `err: ${content} too long(exceed ${maxLen})`
              }
            }
          } else {
            errMsg = `error: ${content} unsupported var type ${this.varAstType}`
          }
        } catch (err) {
          errMsg = `err: ${content} cannot be converted to ${this.varAstType}`
        }
      } else if (this.isOptional) {
        if (this.optSwitch == 1) {
          const optionalItem = this.$refs['optional']
          const [innerResultCv, innerErrMsg] = optionalItem.getCvValue()
          if (!innerErrMsg) {
            resultCv = someCV(innerResultCv)
          } else {
            errMsg = innerErrMsg
          }
        } else {
          resultCv = noneCV()
        }
      } else if (this.isList) {
        resultCv = listCV()
        resultCv.list = []
        for (let i = 0; i < this.listCount; i++) {
          const listItem = this.$refs['listItem' + i][0]
          const [innerResultCv, innerErrMsg] = listItem.getCvValue()
          if (!innerErrMsg) {
            resultCv.list.push(innerResultCv)
          } else {
            errMsg = innerErrMsg
            break
          }
        }
      } else if (this.isTuple) {
        let tObj = {}
        for (let i = 0; i < this.varAstType.fields.length; i++) {
          const tupleItem = this.$refs['tupleItem' + i][0]
          const [innerResultCv, innerErrMsg] = tupleItem.getCvValue()
          if (!innerErrMsg) {
            tObj[this.varAstType.fields[i].name] = innerResultCv
          } else {
            errMsg = innerErrMsg
            break
          }
        }
        resultCv = tupleCV(tObj)
      } else {
        alert('error: call getCvValue failed')
        errMsg = 'error: call getCvValue failed'
      }
      return [resultCv, errMsg]
    },
    onClickAdd(addNum) {
      this.listCount = Math.max(0, this.listCount + addNum)
    },
    // onClickBulkAdd() {
      // this.$prompt('Seperated by , or space', '提示', {
      //   confirmButtonText: 'Ok',
      //   cancelButtonText: 'Cancel',
      // }).then(({ value }) => {
      //   value = value.trim()
      //   let strList = null
      //   if (value.indexOf(',') != -1) {
      //     strList = value.split(',')
      //   } else if (value.indexOf(' ') != -1) {
      //     strList = value.split(' ')
      //   }
      //   if (strList) {
      //     for (let index = strList.length-1; index >= 0; index--) {
      //       if (strList[index].trim().length == 0) {
      //         strList.splice(index, 1)
      //       }
      //     }
      //     for (let v of strList) {
      //       this.varValueList.push(v)
      //     }
      //   }
      // })
    // },
    // onClickRemoveEmpty() {
    // },
    onClickRemoveAll() {
      this.listCount = 0
    },
    innerBorder(astType) {
      if (typeof(astType) == 'object' && astType['combType'] != null) {
        return true
      }
      return false
    },
  },
  computed: {
    isAtom() {
      return typeof(this.varAstType) == "string"
    },
    isOptional() {
      return typeof(this.varAstType) == "object" && this.varAstType.combType == 'optional'
    },
    isList() {
      return typeof(this.varAstType) == "object" && this.varAstType.combType == 'list'
    },
    isTuple() {
      return typeof(this.varAstType) == "object" && this.varAstType.combType == 'tuple'
    },
    getW() {
      return this.w ? this.w : 600
    },
  },
  data() {
    return {
      inputValue: '',
      optSwitch: 1,
      listCount: 0,
    }
  },
}
</script>

<style scoped>
.fsBorder {
  padding: 4px;
  margin-top: 4px;
  margin-bottom: 4px;
  border-radius: 3px;
  border-color: white;
}
.fsNoBorder {
  padding: 0;
  margin-top: 4px;
  margin-bottom: 4px;
  border: none;
}
.listItemAst {
  display: inline-block;
  width: 420px;
  vertical-align: middle;
}
.listBtns {
  margin-top: 2px;
}
</style>
