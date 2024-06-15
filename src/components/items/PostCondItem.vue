<template>
  <div class="item">
    <fieldset class='fsBorder'>
      <legend>Post conditions:</legend>

      <fieldset class='innerFs mode'>
        <legend>Mode</legend>
        <el-radio-group v-model="condMode">
          <el-radio label="2">Deny</el-radio>
          <el-radio label="1">Allow</el-radio>
        </el-radio-group>
      </fieldset>

      <fieldset v-for="index of condList.length" :key="index-1" class='innerFs cond'>
        <legend>
          <el-select size="small" v-model="condList[index-1].condType" placeholder="Select type" @change="onChangeCondType(index-1)">
            <el-option v-for="item in postCondTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <el-button type="info" size="small" class="closeBtn" circle @click="onClickDelete(index-1)">X</el-button>
        </legend>
        <!-- STX -->
        <div v-if='condList[index-1].condType=="STX"'>
          <el-form size="small" ref="form1" :model="condList[index-1]" label-width="110px">
            <el-form-item label="Principal">
              <el-input size="small" v-model="condList[index-1].address" placeholder="EOA or contract"></el-input>
            </el-form-item>
            <el-form-item label="Condition code">
              <el-select v-model="condList[index-1].condCode" placeholder="Select Condition code">
                <el-option v-for="item in ftCmpTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Amount">
              <el-input size="small" v-model="condList[index-1].amount" class="stxField" placeholder="1000000 means 1 STX">
                <!-- <template slot="append">STX</template> -->
              </el-input>
            </el-form-item>
          </el-form>
        </div>
        <!-- FT -->
        <div v-if='condList[index-1].condType=="FT"'>
          <el-form size="small" ref="form1" :model="condList[index-1]" label-width="116px">
            <el-form-item label="Principal">
              <el-input size="small" v-model="condList[index-1].address" placeholder="EOA or contract"></el-input>
            </el-form-item>
            <el-form-item label="Condition code">
              <el-select v-model="condList[index-1].condCode" placeholder="Select condition code">
                <el-option v-for="item in ftCmpTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Amount">
              <el-input size="small" v-model="condList[index-1].amount" class="ftField" placeholder="Calculate decimal yourself">
                <template slot="append">unit</template>
              </el-input>
            </el-form-item>
            <el-form-item label="Token contract">
              <el-input size="small" v-model="condList[index-1].tokenContract" placeholder="Token contract"></el-input>
            </el-form-item>
            <el-form-item label="Token name">
              <el-input size="small" v-model="condList[index-1].tokenName" placeholder="The name used with define-fungible-token"></el-input>
            </el-form-item>
          </el-form>
        </div>
        <!-- NFT -->
        <div v-if='condList[index-1].condType=="NFT"'>
          <el-form size="small" ref="form1" :model="condList[index-1]" label-width="116px">
            <el-form-item label="Principal">
              <el-input size="small" v-model="condList[index-1].address" placeholder="EOA or contract"></el-input>
            </el-form-item>
            <el-form-item label="Condition code">
              <el-select v-model="condList[index-1].condCode" placeholder="Select condition code">
                <el-option v-for="item in nftCmdTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Token contract">
              <el-input size="small" v-model="condList[index-1].tokenContract" placeholder="Token contract"></el-input>
            </el-form-item>
            <el-form-item label="Token name">
              <el-input size="small" v-model="condList[index-1].tokenName" placeholder="The name used with define-non-fungible-token"></el-input>
            </el-form-item>
            <el-form-item label="Token id">
              <el-input size="small" v-model="condList[index-1].tokenId" placeholder="Only support integer"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </fieldset>

      <div style="margin-top:12px">
        <el-button type="primary" plain size="small"  @click="onClickAdd()">Add post condition</el-button>
      </div>
    </fieldset>
  </div>
</template>

<script>
import { createAssetInfo, PostConditionMode, NonFungibleConditionCode, makeStandardSTXPostCondition, makeContractSTXPostCondition, makeStandardFungiblePostCondition, makeContractFungiblePostCondition, makeStandardNonFungiblePostCondition, makeContractNonFungiblePostCondition, FungibleConditionCode, ClarityType, hexToCV, noneCV, cvToValue, bufferCVFromString, bufferCV, stringAsciiCV, stringUtf8CV, tupleCV, intCV, uintCV, trueCV, falseCV, someCV, listCV, standardPrincipalCV, contractPrincipalCV } from '@stacks/transactions'

export default {
  name: 'PostCondItem',
  props: [],
  methods: {
    onClickDelete(index) {
      this.condList.splice(index, 1)
    },
    onClickAdd() {
      this.condList.push({
        condType: '',
        address: '', // principal or contract
        condCode: '',
        amount: '',
        tokenContract: '',
        tokenName: '',
        tokenId: '',
      })
    },
    onChangeCondType(index) {
      let v = this.condList[index]
      v.address = ''
      v.condCode = ''
      v.amount = ''
      v.tokenContract = ''
      v.tokenName = ''
      v.tokenId = ''
    },
    parsePrincipleCv(addr) {
      let [pAddr, pContractName] = [null, null]
      try {
        const parts = addr.trim().split('.')
        if (parts.length == 1) {
          standardPrincipalCV(parts[0])
          pAddr = parts[0]
        } else if (parts.length == 2) {
          contractPrincipalCV(parts[0], parts[1])
          pAddr = parts[0]
          pContractName = parts[1]
        }
      } catch (err) {
        return [false]
      }
      return [true, pAddr, pContractName]
    },
    checkInput(itemData) {
      if (itemData.condType == '') {
        return 'Please select type'
      }
      let [bOk, pAddr, pContractName] = this.parsePrincipleCv(itemData.address)
      if (!bOk) {
        return `invalid Principal input ${itemData.address}`
      }
      if (itemData.condCode == '') {
        return 'invalid condition code'
      }
      if (itemData.condType == 'STX' || itemData.condType == 'FT') {
        if (itemData.amount == '' || parseFloat(itemData.amount) < 0) {
          return `invalid amount ${itemData.amount}`
        }
      }
      if (itemData.condType == 'FT' || itemData.condType == 'NFT') {
        let [bOk, pAddr2, pContractName2] = this.parsePrincipleCv(itemData.tokenContract)
        if (!bOk || !pContractName2) {
          return `invalid token contract ${itemData.tokenContract}`
        }
        if (itemData.tokenName.trim().length <= 0) {
          return 'invalid token name'
        }
      }
      if (itemData.condType == 'NFT') {
        if (itemData.tokenId.length == 0) {
          return 'invalid token id'
        }
        if (itemData.tokenId != 0 && !parseInt(itemData.tokenId)) {
          return `invalid token id ${itemData.tokenId}`
        }
      }
    },
    trim(val) {
      return val.trim()
    },
    getPostCondList() {
      let condList = []
      let errMsg = null
      for (const itemData of this.condList) {
        try {
          const curErrMsg = this.checkInput(itemData)
          if (curErrMsg) {
            errMsg = curErrMsg
            break
          }
          let [bOk, pAddr, pContractName] = this.parsePrincipleCv(itemData.address)
          let resultCond = null
          if (itemData.condType == 'STX') {
            const realAmount = parseInt(itemData.amount.trim())
            if (pContractName) {
              resultCond = makeContractSTXPostCondition(
                pAddr,
                pContractName,
                parseInt(itemData.condCode),
                BigInt(realAmount),
              )
            } else {
              resultCond = makeStandardSTXPostCondition(
                pAddr,
                parseInt(itemData.condCode),
                BigInt(realAmount),
              )
            }
          } else if (itemData.condType == 'FT') {
            let [bOk, tokenAddr, tokenContract] = this.parsePrincipleCv(itemData.tokenContract)
            const fungibleAssetInfo = createAssetInfo(tokenAddr, tokenContract, itemData.tokenName.trim())
            if (pContractName) {
              resultCond = makeContractFungiblePostCondition(
                pAddr,
                pContractName,
                parseInt(itemData.condCode),
                BigInt(itemData.amount.trim()),
                fungibleAssetInfo
              )
            } else {
              resultCond = makeStandardFungiblePostCondition(
                pAddr,
                parseInt(itemData.condCode),
                BigInt(itemData.amount.trim()),
                fungibleAssetInfo
              )
            }
          } else if (itemData.condType == 'NFT') {
            let [bOk, tokenAddr, tokenContract] = this.parsePrincipleCv(itemData.tokenContract)
            const nonFungibleAssetInfo = createAssetInfo(tokenAddr, tokenContract, itemData.tokenName.trim());
            if (pContractName) {
              resultCond = makeContractNonFungiblePostCondition(
                pAddr,
                pContractName,
                parseInt(itemData.condCode),
                nonFungibleAssetInfo,
                uintCV(itemData.tokenId.trim())
              )
            } else {
              resultCond = makeStandardNonFungiblePostCondition(
                pAddr,
                parseInt(itemData.condCode),
                nonFungibleAssetInfo,
                uintCV(itemData.tokenId.trim())
              )
            }
          }
          if (resultCond) {
            condList.push(resultCond)
          } else {
            errMsg = `parse post-condition fail 2`
            break
          }
        } catch (err) {
          console.log('getPostCondList fail: ', err)
          errMsg = `parse post-condition fail, see console`
          break
        }
      }
      return [errMsg, this.condMode, condList]
    },
  },
  data() {
    return {
      postCondTypeList: [
        {
          value: 'STX',
          label: 'STX'
        },
        {
          value: 'FT',
          label: 'FT'
        },
        {
          value: 'NFT',
          label: 'NFT'
        },
      ],
      ftCmpTypeList: [
        {
          value: FungibleConditionCode.Equal,
          label: '=='
        },
        {
          value: FungibleConditionCode.LessEqual,
          label: '<='
        },
        {
          value: FungibleConditionCode.Less,
          label: '<'
        },
        {
          value: FungibleConditionCode.Greater,
          label: '>'
        },
        {
          value: FungibleConditionCode.GreaterEqual,
          label: '>='
        },
      ],
      nftCmdTypeList: [
        {
          value: NonFungibleConditionCode.Owns,
          label: 'Owns'
        },
        {
          value: NonFungibleConditionCode.DoesNotOwn,
          label: 'DoesNotOwn'
        },
      ],
      condMode: PostConditionMode.Deny.toString(),
      condList: [
        // {
        //   condType: '',
        //   address: '', // principal or contract
        //   condCode: '',
        //   amount: '',
        //   tokenContract: '',
        //   tokenName: '',
        // },
      ],
    }
  },
}
</script>

<!-- export declare function makeStandardSTXPostCondition(address: string, conditionCode: FungibleConditionCode, amount: BigNum): STXPostCondition;
export declare function makeContractSTXPostCondition(address: string, contractName: string, conditionCode: FungibleConditionCode, amount: BigNum): STXPostCondition;
export declare function makeStandardFungiblePostCondition(address: string, conditionCode: FungibleConditionCode, amount: BigNum, assetInfo: string | AssetInfo): FungiblePostCondition;
export declare function makeContractFungiblePostCondition(address: string, contractName: string, conditionCode: FungibleConditionCode, amount: BigNum, assetInfo: string | AssetInfo): FungiblePostCondition;
export declare function makeStandardNonFungiblePostCondition(address: string, conditionCode: NonFungibleConditionCode, assetInfo: string | AssetInfo, assetName: ClarityValue): NonFungiblePostCondition;
export declare function makeContractNonFungiblePostCondition(address: string, contractName: string, conditionCode: NonFungibleConditionCode, assetInfo: string | AssetInfo, assetName: ClarityValue): NonFungiblePostCondition; -->


<style scoped>
.fsBorder {
  width: 580px;
  border-radius: 3px;
  border-color: white;
  margin-top: 8px;
  margin-bottom: 8px;
}
.innerFs {
  width: 550px;
  border-radius: 3px;
  border-color: white;
  margin-left: 0;
  min-height: 40px;
}
.mode {
  margin-top: 1px;
  margin-bottom: 16px;
  padding-top: 4px;
}
.cond {
  margin-top: 16px;
  margin-bottom: 16px;
  padding-top: 12px;
  padding-bottom: 0px;
}
.stxField {
  width: 180px;
}
.ftField {
  width: 252px;
}
.closeBtn {
  margin-left: 2px;
}
</style>
