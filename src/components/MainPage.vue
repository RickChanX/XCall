<template>
  <div id='main'>
    <!-- Account -->
    <div>
      <span v-if="!bNeedSignIn" style="margin-right:8px">Address: {{ curLoginAddress }}</span>
      <el-button type="primary" @click="onClickLoginIn" v-if='bNeedSignIn'>Sign in</el-button>
      <el-button type="info" @click="onClickLoginOut" v-if='!bNeedSignIn'>Sign out</el-button>
    </div>
    <hr />

    <el-space direction="vertical" alignment="start" size="large">
      <el-space>
        <span>Network:</span>
        <el-select size="large" style="width: 120px;" v-model="netType" placeholder="Please select" @change="onChangeNetwork">
          <el-option value="mainnet" label="Mainnet"></el-option>
          <el-option value="testnet" label="Testnet"></el-option>
        </el-select>
        <el-input size="large" style="width: 500px" clearable placeholder="coreApiUrl" v-model="coreApiUrl" @change="onChangeCoreApi"></el-input>
      </el-space>
      <el-space>
        <span>Contract:</span>
        <el-input size="large" style="width: 625px" clearable placeholder="Contract address" v-model="curContractAddr"></el-input>
        <el-button size="large" type="primary" :disabled="curContractAddr.trim().length==0" @click="onClickLoadContract">Load</el-button>
        <el-button size="large" type="primary" plain @click="onClickHistory">History</el-button>
      </el-space>
    </el-space>

    <el-tabs v-model="curTab" :style='{visibility: state == 2 ? "visible" : "hidden"}' class="tabArea">
      <!-- Variables -->
      <el-tab-pane label="Variables" v-if="varList.length > 0" name="variables">
        <div style="margin-bottom: 8px;">
          <el-button type="primary" plain style='display:inline-block' @click="onClickLoadAllVar">Load all</el-button>
          <el-button type="info" plain style='display:inline-block' @click="onClickCollapseAll(varDatas.activeIndexList)">Collapse all</el-button>
        </div>
        <el-collapse v-model="varDatas.activeIndexList" @change="handleChangeVarCollapse" class="tabCollapse">
          <el-collapse-item v-for="index of varList.length" :key="index-1" :name="index-1">
            <template #title>
              <span class="boldTitle">{{ varList[index-1].name }}</span>
            </template>
            <div class="queryResult" v-loading="varList[index-1].serverState==1">
              <div v-if='varList[index-1].serverState==2'>
                {{ varList[index-1].serverValue }}
                <span class="typeTip" v-if="varList[index-1].serverState==2">&nbsp;{{ varList[index-1].unifyType }}</span>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>

      <!-- Maps -->
      <el-tab-pane label="Maps" v-if="mapList.length > 0" name="maps">
        <div style="margin-bottom: 8px;">
          <el-button type="info" plain style='display: inline-block' @click="onClickCollapseAll(mapDatas.activeIndexList)">Collapse all</el-button>
        </div>
        <el-collapse v-model="mapDatas.activeIndexList" style="max-width: 660px;">
          <el-collapse-item v-for="index of mapList.length" :key="index-1" :name="index-1">
            <template #title>
              <span class="boldTitle">{{ mapList[index-1].name }}</span>
            </template>
            <span class="typeTip">{{ mapList[index-1].unifyKeyType }}</span>
            =>
            <span class="typeTip">{{ mapList[index-1].unifyValueType }}</span>
            <ASTItem :ref='"map" + (index-1)' :varAstType="mapList[index-1].keyAstType"></ASTItem>
            <el-button class="queryBtn" type="primary" plain @click="onClickQueryMap(index-1)">Query</el-button>
            <div class="queryResult" v-loading='mapDatas.queryResult[index-1]=="\t"' v-if='mapDatas.queryResult[index-1] != null'>{{ mapDatas.queryResult[index-1] }}</div>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>

      <!-- Read-only functions -->
      <el-tab-pane label="Read" v-if="readFuncList.length > 0" name="read">
        <div style="margin-bottom: 8px;">
          <el-button type="info" plain style='display:inline-block' @click="onClickCollapseAll(readFuncDatas.activeIndexList)">Collapse all</el-button>
        </div>
        <el-collapse v-if="readFuncList.length > 0" v-model="readFuncDatas.activeIndexList" class="tabCollapse">
          <el-collapse-item v-for="index of readFuncList.length" :key="index-1" :name="index-1">
            <template #title>
              <span class="boldTitle">{{ readFuncList[index-1].name }}</span>
            </template>
            <!-- <span class="typeTip">{{ readFuncList[index-1].paramsDesc }}</span>
            =>
            <span class="typeTip">{{ readFuncList[index-1].resultType }}</span> -->
            <ArgsItem :ref='"readfunc" + (index-1)' :argList="readFuncList[index-1].argAstList"></ArgsItem>
            <el-button type="primary" class="queryBtn" plain @click="onClickCallReadonly(index-1)">Query</el-button>
            <div class="queryResult" v-loading="readFuncDatas.queryResult[index-1]=='\t'" v-if='readFuncDatas.queryResult[index-1] != null'>{{ readFuncDatas.queryResult[index-1] }}</div>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>

      <!-- Public functions -->
      <el-tab-pane label="Write" v-if="writeFuncList.length > 0" name="write">
        <el-alert effect="dark" title="The sign-in account should match the account in wallet app." type="info" style="width:660px"></el-alert>
        <div style="margin-top: 8px; margin-bottom: 8px;">
          <el-button v-if="bNeedSignIn" type="primary" @click="onClickLoginIn">Sign in</el-button>
          <el-button type="info" plain style='display:inline-block' @click="onClickCollapseAll(writeFuncDatas.activeIndexList)">Collapse all</el-button>
        </div>
        <el-collapse v-model="writeFuncDatas.activeIndexList" class="tabCollapse">
          <el-collapse-item v-for="index of writeFuncList.length" :key="index-1" :name="index-1">
            <template #title>
              <span class="boldTitle">{{ writeFuncList[index-1].name }}</span>
            </template>
            <!-- <span class="typeTip">{{ writeFuncList[index-1].paramsDesc }}</span>
            =>
            <span class="typeTip">{{ writeFuncList[index-1].resultType }}</span> -->
            <ArgsItem :ref='"writefunc" + (index-1)' :argList="writeFuncList[index-1].argAstList"></ArgsItem>
            <PostCondItem :ref='"postCond" + (index-1)'></PostCondItem>
            <el-button :disabled="bNeedSignIn" type="primary" plain @click="onClickCallPublic(index-1)">Call</el-button>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
    </el-tabs>

    <el-drawer size='700' v-model="historyDatas.bVisible" title="History" direction="rtl">
      <el-table
        :data="historyDatas.tableData"
        highlight-current-row
        @current-change="onClickSelectContract"
      >
        <!-- <el-table-column type="index" width="50" /> -->
        <el-table-column label="Contract name" width="180">
          <template #default="scope">
            <div>{{ scope.row.name }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Contract address" width="400">
          <template #default="scope">
            <div>{{ scope.row.address }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Chain">
          <template #default="scope">
            <div>{{ scope.row.netType }}</div>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>    
  </div>
</template>

<script>
import { getAppDetails, userSession, getAddress, loginIn, loginOut } from '../stacks/auth'
import { StacksMainnet, StacksTestnet, StacksMocknet } from '@stacks/network'
import { openContractCall } from '@stacks/connect'
import { callReadOnlyFunction, ClarityType, hexToCV, cvToHex, contractPrincipalCV, cvToValue, standardPrincipalCV } from '@stacks/transactions'
import { Utils } from '../utils/utils'
import fetch from 'cross-fetch';

export default {
  name: 'MainPage',
  components: {
  },
  data () {
    return {
      netType: '',
      curNetwork: null,
      coreApiUrl: '',
      // curContractAddr: 'SP3Y4BVTB26G7VVFPYAZ90TCX8Z38T2EZ4YJE7D34.namespace',
      // curContractAddr: 'SP3XYJ8XFZYF7MD86QQ5EF8HBVHHZFFQ9HM6SPJNQ.market-v2',
      curContractAddr: '',
      state: 0,
      curContractPair: [],
      constList: [
      ],
      ///
      varList: [
      ],
      varDatas: {
        activeIndexList: [],
        loading: null,
        fetchAllIndexList: [],
        fetchAllFinishCount: 0,
        fetchAllNextIndex: 0,
      },
      ///
      mapList: [
      ],
      mapDatas: {
        activeIndexList: [],
        queryResult: {},
      },
      ///
      readFuncList: [
      ],
      readFuncDatas: {
        activeIndexList: [],
        queryResult: {},
      },
      ///
      writeFuncList: [
      ],
      writeFuncDatas: {
        activeIndexList: [],
      },
      curTab: '',
      directConvertCVTypes: {
        [ClarityType.Int]: true,
        [ClarityType.UInt]: true,
        [ClarityType.Buffer]: true,
        [ClarityType.BoolTrue]: true,
        [ClarityType.BoolFalse]: true,
        [ClarityType.PrincipalStandard]: true,
        [ClarityType.PrincipalContract]: true,
        [ClarityType.StringASCII]: true,
        [ClarityType.StringUTF8]: true,
      },
      /// History
      historyDatas: {
        bVisible: false,
        tableData: [
          // {
          //   netType: 'mainnet',
          //   address: 'SP2P97XC3QJBB9SAZQ4SFHXDVV3J48RWSCZY52RVD',
          //   name: 'xcall',
          // },
        ]
      },
    }
  },
  async mounted() {
    const prefNetType = localStorage.getItem('netType')
    this.netType = prefNetType ? prefNetType : 'mainnet'
    this.updateNetwork()
    const prefContract = localStorage.getItem('contract')
    this.curContractAddr = prefContract ? prefContract : ''
    this.loadHistoryData()
  },
  computed: {
    bNeedSignIn() {
      return !userSession.isUserSignedIn()
    },
    curLoginAddress() {
      return this.bNeedSignIn ? '' : getAddress()
    },
    targetContractUrl() {
      if (this.netType == 'mainnet') {
        return `https://explorer.hiro.so/txid/${this.curContractAddr}?chain=mainnet`
      } else if (this.netType == 'testnet') {
        return `https://explorer.hiro.so/txid/${this.curContractAddr}?chain=testnet`
      }
    },
  },
  methods: {
    onClickLoginIn() {
      loginIn()
    },
    onClickLoginOut() {
      loginOut()
    },
    resetBeforeLoad() {
      this.state = 0
      this.curContractPair.splice(0, this.curContractPair.length)
      this.constList.splice(0, this.constList.length)
      this.varList.splice(0, this.varList.length)
      this.varDatas.activeIndexList.splice(0, this.varDatas.activeIndexList.length)
      this.mapList.splice(0, this.mapList.length)
      this.mapDatas.activeIndexList.splice(0, this.mapDatas.activeIndexList.length)
      this.readFuncList.splice(0, this.readFuncList.length)
      this.readFuncDatas.activeIndexList.splice(0, this.readFuncDatas.activeIndexList.length)
      this.writeFuncList.splice(0, this.writeFuncList.length)
      this.writeFuncDatas.activeIndexList.splice(0, this.writeFuncDatas.activeIndexList.length)
    },
    onChangeNetwork() {
      this.updateNetwork()
      localStorage.setItem('netType', this.netType)
    },
    updateNetwork() {
      this.curNetwork = null
      const customApiUrl = localStorage.getItem(this.netType)
      if (this.netType == 'mainnet') {
        this.coreApiUrl =  customApiUrl ? customApiUrl : 'https://api.hiro.so'
        this.curNetwork = new StacksMainnet()
      } else if (this.netType == 'testnet') {
        this.coreApiUrl = customApiUrl ? customApiUrl : 'https://api.testnet.hiro.so'
        this.curNetwork = new StacksTestnet()
      }
      this.curNetwork.coreApiUrl = this.coreApiUrl
    },
    onChangeCoreApi() {
      this.curNetwork.coreApiUrl = this.coreApiUrl
      localStorage.setItem(this.netType, this.coreApiUrl)
    },
    async onClickLoadContract() {
      this.resetBeforeLoad()
      this.state = 1
      if (!this.trContract(this.curContractAddr)) {
        Utils.tipErr('Invalid contract address')
        return
      }
      let loading = this.createLoading('Loading')
      let [contractAddr, contractName] = this.curContractAddr.split('.')
      this.curContractPair.push(contractAddr, contractName)
      try {
        const res = await fetch(`${this.coreApiUrl}/v2/contracts/interface/${contractAddr}/${contractName}`)
        loading.close()
        if (res.status == 200) {
          localStorage.setItem('contract', this.curContractAddr)
          this.saveHistoryContracts()
          this.state = 2
          this.queryContractABIFinish(await res.json())
        } else {
          Utils.tipErr(`Request fail, status=${res.status}`)
        }
      } catch (err) {
        loading.close()
        Utils.tipErr('Request fail, check console log')
        console.error('error: request contract interface error:', err)
      }
    },
    queryContractABIFinish(result) {
      // console.log('___queryContractABIFinish', result)
      // constant, variable
      for (let varInfo of result.variables) {
        const tmpVarInfo = Object.assign({}, varInfo)
        tmpVarInfo.unifyType = this.parseUnifyType(varInfo.type)
        tmpVarInfo.serverState = 0
        tmpVarInfo.serverValue = ''
        if (tmpVarInfo.access == 'constant') {
          this.constList.push(tmpVarInfo)
        } else if (tmpVarInfo.access == 'variable') {
          this.varList.push(tmpVarInfo)
        }
      }
      // maps
      for (let mapInfo of result.maps) {
        const tmpMapInfo = Object.assign({}, mapInfo)
        tmpMapInfo.unifyKeyType = this.parseUnifyType(tmpMapInfo.key)
        tmpMapInfo.keyAstType = this.parseTypeAst(tmpMapInfo.key)
        tmpMapInfo.unifyValueType = this.parseUnifyType(tmpMapInfo.value)
        this.mapList.push(tmpMapInfo)
      }
      // functions
      for (let funcInfo of result.functions) {
        const tmpFuncInfo = Object.assign({}, funcInfo)
        let argPartList = []
        let argAstList = []
        for (let argItem of tmpFuncInfo.args) {
          argItem.unifyType = this.parseUnifyType(argItem.type)
          argPartList.push(`(${argItem.name} ${argItem.unifyType})`)
          argAstList.push({
            name: argItem.name,
            astType: this.parseTypeAst(argItem.type),
          })
        }
        tmpFuncInfo.argAstList = argAstList
        tmpFuncInfo.paramsDesc = argPartList.length > 0 ? `${argPartList.join(' ')}` : 'none'
        tmpFuncInfo.resultType = this.parseUnifyType(tmpFuncInfo.outputs.type)
        if (tmpFuncInfo.access == 'public') {
          this.writeFuncList.push(tmpFuncInfo)
        } else if (tmpFuncInfo.access == 'read_only') {
          this.readFuncList.push(tmpFuncInfo)
        }
      }
      ///
      if (this.readFuncList.length > 0) {
        this.curTab = 'read'
      } else if (this.varList.length > 0) {
        this.curTab = 'variables'
      } else if (this.mapList.length > 0) {
        this.curTab = 'maps'
      } else if (this.writeFuncList.length > 0) {
        this.curTab = 'write'
      } else {
        this.curTab = 'source'
      }
    },
    //////////////////////////////////////// History begin ////////////////////////////////////////
    onClickHistory() {
      this.historyDatas.bVisible = true
    },
    onClickSelectContract(val) {
      this.historyDatas.bVisible = false
      if (val && val.netType && val.address && val.name) {
        if (this.netType != val.netType) {
          this.netType = val.netType
          this.onChangeNetwork()
        }
        this.curContractAddr = `${val.address}.${val.name}`
        this.onClickLoadContract()
      }
    },
    loadHistoryData() {
      this.historyDatas.tableData.splice(0, this.historyDatas.tableData.length)
      const historyContracts = localStorage.getItem('historyContracts')
      if (historyContracts) {
        const arr = JSON.parse(historyContracts)
        if (arr) {
          this.historyDatas.tableData.push(...arr)
        }
      }
    },
    saveHistoryContracts() {
      let arr = []
      arr.push({
        netType: this.netType,
        address: this.curContractPair[0],
        name: this.curContractPair[1],
      })
      for (const v of this.historyDatas.tableData) {
        if (v.address != this.curContractPair[0] || v.name != this.curContractPair[1]) {
          arr.push(v)
          if (arr.length >= 15) {
            break
          }
        }
      }
      this.historyDatas.tableData.splice(0, this.historyDatas.tableData.length)
      this.historyDatas.tableData.push(...arr)
      localStorage.setItem('historyContracts', JSON.stringify(this.historyDatas.tableData))
    },
    //////////////////////////////////////// History end ////////////////////////////////////////
    //////////////////////////////////////// Variables begin ////////////////////////////////////////
    resetFetchAllVarInfo() {
      this.varDatas.activeIndexList.splice(0, this.varDatas.activeIndexList.length)
      if (this.varDatas.loading) {
        this.varDatas.loading.close()
        this.varDatas.loading = null
      }
      let fetchAllIndexList = this.varDatas.fetchAllIndexList
      fetchAllIndexList.splice(0, fetchAllIndexList.length)
      this.varDatas.fetchAllFinishCount = 0
      this.varDatas.fetchAllNextIndex = 0
    },
    async onClickLoadAllVar() {
      this.resetFetchAllVarInfo()

      let fetchAllIndexList = this.varDatas.fetchAllIndexList
      for (let index = 0; index < this.varList.length; index++) {
        const varInfo = this.varList[index]
        varInfo.serverState = 0
        varInfo.serverValue = ''
        fetchAllIndexList.push(index)
      }

      this.updateVarLoadingTip(false, true)
      const threadCount = Math.min(8, fetchAllIndexList.length)
      this.varDatas.fetchAllNextIndex = threadCount
      for (let i = 0; i < threadCount; i++) {
        this.fetchVar(fetchAllIndexList[i], true)
      }
    },
    updateVarLoadingTip(bBlock, bFromLoadAll) {
      if (!this.varDatas.loading) {
        this.varDatas.loading = this.createLoading('', 'rgba(0,0,0,0.7)')
      }
      let text = ''
      if (bFromLoadAll) {
        const initialFinishCount = this.varList.length - this.varDatas.fetchAllIndexList.length
        const progressCount = Math.min(initialFinishCount + this.varDatas.fetchAllFinishCount + 1, this.varList.length)
        text = `Loading ${progressCount}/${this.varList.length}`
      } else {
        text = 'Loading'
      }
      if (bBlock) {
        this.varDatas.loading.text = text + '(Blocked by server, wait 1 minute)'
      }
      this.varDatas.loading.text = text
    },
    async handleChangeVarCollapse() {
      for (let varIndex of this.varDatas.activeIndexList) {
        const varInfo = this.varList[varIndex]
        if (varInfo['serverState'] && varInfo.serverState > 0) {
          continue
        }
        await this.fetchVar(varIndex, false)
      }
    },
    async fetchVar(varIndex, bFromLoadAll) {
      while (true) {
        let varInfo = this.varList[varIndex]
        try {
          varInfo.serverState = 1
          const res = await fetch(`${this.coreApiUrl}/v2/data_var/${this.curContractPair[0]}/${this.curContractPair[1]}/${varInfo.name}`)
          if (res.status == 200) {
            varInfo.serverState = 2
            const rsp = await res.json()
            varInfo.serverValue = this.parseCVValue(hexToCV(rsp.data), varInfo.unifyType)
          } else {
            varInfo.serverState = 0
            Utils.tipErr(`error: fetchVar ${varInfo.name} error, status=${res.status}`)
          }
        } catch (err) {
          varInfo.serverState = 0
          Utils.tipErr('Request fail, check console log')
          console.error(`error: fetchVar ${varInfo.name} error:`, err)
        }

        if (varInfo.serverState == 2) {
          if (bFromLoadAll) {
            this.varDatas.fetchAllFinishCount++
            this.updateVarLoadingTip(false, bFromLoadAll)
            if (this.varDatas.activeIndexList.indexOf(varIndex) == -1) {
              this.varDatas.activeIndexList.push(varIndex)
            }
            if (this.varDatas.fetchAllNextIndex < this.varDatas.fetchAllIndexList.length) {
              this.fetchVar(this.varDatas.fetchAllIndexList[this.varDatas.fetchAllNextIndex++], bFromLoadAll)
            } else if (this.varDatas.fetchAllFinishCount == this.varDatas.fetchAllIndexList.length) {
              this.varDatas.loading.close()
              Utils.tipOk('Load finish')
            }
          }
          break
        } else {
          this.updateVarLoadingTip(true, bFromLoadAll)
          await new Promise(r => setTimeout(r, 5000)) // wait 5 seconds to request again
        }
      }
    },
    parseCVValue(cv, unifyType) {
      try {
        if (this.directConvertCVTypes[cv.type]) {
          const tmpResult = cvToValue(cv).toString()
          if (cv.type == ClarityType.StringASCII || cv.type == ClarityType.StringUTF8) {
            return `"${tmpResult}"`
          } else if (cv.type == ClarityType.UInt) {
            return `u${tmpResult}`
          } else if (cv.type == ClarityType.PrincipalStandard || cv.type == ClarityType.PrincipalContract) {
            return `'${tmpResult}`
          } else {
            return tmpResult
          }
        }
        if (cv.type == ClarityType.OptionalNone) {
          return 'none'
        }
        if (cv.type == ClarityType.OptionalSome) {
          return `(some ${this.parseCVValue(cv.value)})`
        }
        if (cv.type == ClarityType.ResponseOk) {
          return `(ok ${this.parseCVValue(cv.value)})`
        }
        if (cv.type == ClarityType.ResponseErr) {
          return `(err ${this.parseCVValue(cv.value)})`
        }
        if (cv.type == ClarityType.List) {
          let items = []
          for (const v of cv.list) {
            items.push(this.parseCVValue(v))
          }
          return `(list ${items.join(' ')})`
        }
        if (cv.type == ClarityType.Tuple) {
          let items = []
          for (const [k, v] of Object.entries(cv.data)) {
            if (typeof(v) == 'object' && v['type'] != null) {
              const vResult = this.parseCVValue(v)
              items.push(`${k}: ${vResult}`)
            }
          }
          return `{ ${items.join(', ')} }`
        }
        return `error: unknown clarity type ${cv.type}`
      } catch (err) {
        console.log('parse value err: ', err)
        return 'parse error'
      }
    },    
    //////////////////////////////////////// Variables end ////////////////////////////////////////

    //////////////////////////////////////// Maps begin ////////////////////////////////////////
    async onClickQueryMap(index) {
      this.mapDatas.queryResult[index] = '\t'
      //
      const mapInfo = this.mapList[index]
      let mapItem = this.$refs["map" + index][0]
      const [cv, errMsg] = mapItem.getCvValue()
      if (errMsg) {
        this.mapDatas.queryResult[index] = ''
        this.$alert(errMsg, 'error', {
          confirmButtonText: 'Ok',
        })
        return
      }
      // console.log('___onClickQueryMap: ', cv)
      const hex = cvToHex(cv)
      try {
        const res = await fetch(`${this.coreApiUrl}/v2/map_entry/${this.curContractPair[0]}/${this.curContractPair[1]}/${mapInfo.name}`, {
          method: "post",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(hex)
        })
        if (res.status == 200) {
          const rsp = await res.json()
          const result = this.parseCVValue(hexToCV(rsp.data), mapInfo.unifyValueType)
          this.mapDatas.queryResult[index] = result
        } else {
          this.mapDatas.queryResult[index] = ''
          Utils.tipErr(`error: fetch map entry ${mapInfo.name} error, status=${res.status}`)
        }
      } catch (err) {
        this.mapDatas.queryResult[index] = ''
        Utils.tipErr('Request fail, check console log')
        console.error(`error: fetch map entry ${mapInfo.name} error:`, err)
      }
    },
    //////////////////////////////////////// Maps End ////////////////////////////////////////

    //////////////////////////////////////// Read-only functions begin ////////////////////////////////////////
    async onClickCallReadonly(index) {
      this.readFuncDatas.queryResult[index] = '\t'
      //
      const funcInfo = this.readFuncList[index]
      let argsItem = this.$refs["readfunc" + index][0]
      const [argList, errMsg] = argsItem.getArgList()
      if (errMsg) {
        this.readFuncDatas.queryResult[index] = ''
        this.$alert(errMsg, 'error', {
          confirmButtonText: 'Ok',
        })
        return
      }
      try {
        const options = {
          contractAddress: this.curContractPair[0],
          contractName: this.curContractPair[1],
          functionName: funcInfo.name,
          functionArgs: argList,
          network: this.curNetwork,
          senderAddress: this.curContractPair[0],
        };
        const summaryRsp = await callReadOnlyFunction(options)
        // console.log('___summaryRsp: ', summaryRsp)
        const result = this.parseCVValue(summaryRsp, funcInfo.resultType)
        this.readFuncDatas.queryResult[index] = result
      } catch (err) {
        this.readFuncDatas.queryResult[index] = ''
        Utils.tipErr('Request fail, check console log')
        console.error(`error: call read-only function ${funcInfo.name} fail, error:`, err)
      }
    },
    //////////////////////////////////////// Read-only functions End ////////////////////////////////////////

    //////////////////////////////////////// Call public begin ////////////////////////////////////////
    onClickCallPublic(index) {
      const funcInfo = this.writeFuncList[index]
      let argsItem = this.$refs["writefunc" + index][0]
      const [argList, errMsg] = argsItem.getArgList()
      if (errMsg) {
        this.$alert(errMsg, 'Param error', {
          confirmButtonText: 'Ok',
        })
        return
      }

      let postCondItem = this.$refs["postCond" + index][0]
      const [errPostMsg, condMode, condList] = postCondItem.getPostCondList()
      if (errPostMsg) {
        this.$alert(errPostMsg, 'Post condition error', {
          confirmButtonText: 'Ok',
        })
        return
      }

      // const [postCondMode, postCondList, errMsg] = ;
      let outThis = this
      const options = {
        contractAddress: this.curContractPair[0],
        contractName: this.curContractPair[1],
        functionName: funcInfo.name,
        functionArgs: argList,
        network: this.curNetwork,
        appDetails: getAppDetails(),
        postConditions: condList,
        postConditionMode: parseInt(condMode),
        onFinish: data => {
          Utils.alert('Transaction has been sent', { title: funcInfo.name })
        },
      };
      openContractCall(options)
    },
    //////////////////////////////////////// Call public End ////////////////////////////////////////

    //////////////////////////////////////// Common begin ////////////////////////////////////////
    parseUnifyType(typeV) {
      if (typeV == 'int128') {
        return 'int'
      }
      if (typeV == 'uint128') {
        return 'uint'
      }
      if (typeof(typeV) == 'object') {
        if (typeV['optional']) {
          const innerTypeV = this.parseUnifyType(typeV.optional)
          return `(optional ${innerTypeV})`
        }
        if (typeV['list']) {
          const innerTypeV = this.parseUnifyType(typeV.list.type)
          return `(list ${typeV.list.length} ${innerTypeV})`
        }
        if (typeV['buffer']) {
          return `(buff ${typeV.buffer.length})`
        }
        if (typeV['string-ascii']) {
          return `(string-ascii ${typeV['string-ascii'].length})`
        }
        if (typeV['string-utf8']) {
          return `(string-utf8 ${typeV['string-utf8'].length})`
        }
        if (typeV['tuple']) {
          let itemStrList = []
          for (const v of typeV.tuple) {
            const curTypeStr = this.parseUnifyType(v.type)
            itemStrList.push(`${v.name}: ${curTypeStr}`)
          }
          return `{${itemStrList.join(', ')}}`
        }
        if (typeV['response']) {
          const okType = this.parseUnifyType(typeV.response.ok)
          const errType = this.parseUnifyType(typeV.response.error)
          return `(response ${okType} ${errType})`
        }
      }
      if (typeV == 'trait_reference') {
        return '<trait>'
      }
      return typeV
    },
    parseTypeAst(typeV) {
      if (typeV == 'int128') {
        return 'int'
      }
      if (typeV == 'uint128') {
        return 'uint'
      }
      if (typeof(typeV) == 'object') {
        if (typeV['optional']) {
          return {
            combType: 'optional',
            astType: this.parseTypeAst(typeV.optional)
          }
        }
        if (typeV['list']) {
          return {
            combType: 'list',
            astType: this.parseTypeAst(typeV.list.type),
            maxCount: typeV.list.length,
          }
        }
        if (typeV['buffer']) {
          return `(buff ${typeV.buffer.length})`
        }
        if (typeV['string-ascii']) {
          return `(string-ascii ${typeV['string-ascii'].length})`
        }
        if (typeV['string-utf8']) {
          return `(string-utf8 ${typeV['string-utf8'].length})`
        }
        if (typeV['tuple']) {
          let fields = []
          for (const v of typeV.tuple) {
            fields.push({
              name: v.name,
              astType: this.parseTypeAst(v.type)
            })
          }
          return {
            combType: 'tuple',
            fields: fields,
          }
        }
      }
      return typeV
    },
    async onClickCollapseAll(indexList) {
      indexList.splice(0, indexList.length)
    },
    createLoading(tips, bg) {
      return this.$loading({
        lock: true,
        text: tips,
        spinner: 'el-icon-loading',
        background: bg ? bg : 'rgba(0, 0, 0, 0.05)'
      });
    },
    trEOA(addr) {
      let result = null
      if (addr) {
        try {
          result = standardPrincipalCV(realTargetAddr)
        } catch (err) {
          result = null
        }
      }
      return result
    },
    trContract(addr) {
      let result = null
      if (addr && addr.indexOf('.') != -1) {
        try {
          let [contractAddr, contractName] = addr.split('.')
          result = contractPrincipalCV(contractAddr, contractName)
        } catch (err) {
          result = null
        }
      }
      return result
    },
    trPrinciple(addr) {
      let result = this.trEOA(addr)
      if (!result) {
        result = this.trContract(addr)
      }
      return result
    },
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#main {
  margin: 50px;
  text-align: left;
  min-height: 400px;
}
.itemTitle {
  margin-right: 8px;
}
.queryResult {
  margin-top: 10px;
  min-height: 25px;
  word-break: break-word;
  font-size: 15px;
  margin-bottom: -10px;
  padding-right: 4px;
}
.tabCollapse {
  max-width: 660px;
}
.typeTip {
  color: #666;
  font-size: 14px;
}
.queryBtn {
  margin-top: 2px;
}
.boldTitle {
  font-size: 14px;
  color: black;
}
.tabArea {
  margin-bottom: 300px;
}
</style>

<style>
.el-collapse-item__wrap {
  margin-left: 8px;
}
.el-collapse-item__header {
  background-color: #f7f8f9;
  height: 36px;
  padding-left: 8px;
  color: black;
}
.el-collapse-item {
  margin: 12px auto;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
}
.el-collapse-item__content {
  padding: 0px auto;
  color: black;
}
</style>
