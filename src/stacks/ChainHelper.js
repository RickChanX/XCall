import { Utils } from '../utils/utils';
import { getNetwork, getNetType } from './auth'
import { bufferCVFromString, callReadOnlyFunction, cvToValue, cvToHex, uintCV } from '@stacks/transactions'

const network = getNetwork();

export const ChainHelper = {
  async getAccountBalance(addr) {
    if (!addr) {
      return
    }
    const res = await fetch(`${network.coreApiUrl}/extended/v1/address/${addr}/stx`)
    if (res.status == 200) {
      const rsp = await res.json()
      return parseInt(rsp.balance)
    }
    return
  },
  async getNFTHoldings(contractAddress, contractName, nftName, address, limit, offset) {
    if (!contractAddress || !contractName || !nftName || !address) {
      return
    }
    let url = `${network.coreApiUrl}/extended/v1/tokens/nft/holdings?principal=${address}&asset_identifiers=${contractAddress}.${contractName}::${nftName}`
    if (limit) {
      url = url + `&limit=${limit}`
    }
    if (offset) {
      url = url + `&offset=${offset}`
    }
    const res = await fetch(url)
    if (res.status == 200) {
      const rsp = await res.json()
      return rsp
    }
  },
  // str maybe EOA, CA, BNS
  async resolveAddress(str) {
    const defaultErrMsg = 'Address invalid'
    if (!str || str.length == 0) {
      return { ret: -1, errMsg: defaultErrMsg }
    }
    if (str.indexOf('.') == -1) {
      return { ret: 0, value: str }
    }
    const parts = str.split('.')
    if (parts.length != 2) {
      return { ret: -2, errMsg: defaultErrMsg }
    }
    if (parts[0].startsWith('SP') && Utils.parseAddress(parts[0])) {
      return { ret: 0, value: str }
    }
    const bnsAddress = 'SP000000000000000000002Q6VF78'
    const options = {
      contractAddress: bnsAddress,
      contractName: 'bns',
      functionName: 'name-resolve',
      functionArgs: [bufferCVFromString(parts[1].toLowerCase()), bufferCVFromString(parts[0].toLowerCase())],
      network,
      senderAddress: bnsAddress,
    };
    const summaryRsp = await callReadOnlyFunction(options);
    let serverData = cvToValue(summaryRsp)
    // console.log('___reqResolveName: ', serverData)
    if (serverData.type == 'int') {
      return { ret: -1, errMsg: 'BNS name not exists' }
    }
    return { ret: 0, value: serverData.value['owner'].value }
  },
  // offset[optional]
  async queryNFTHistory(contracAddress, contractName, nftName, tokenId, offset) {
    if (!tokenId) {
      return
    }
    try {
      const realOffset = offset ? offset : 0
      const fullUrl = `${network.coreApiUrl}/extended/v1/tokens/nft/history?asset_identifier=${contracAddress}.${contractName}::${nftName}&value=${cvToHex(uintCV(tokenId))}&offset=${realOffset}`
      const res = await fetch(fullUrl)
      if (res.status == 200) {
        const rsp = await res.json()
        const lastEvent = rsp.results.length > 0 ? rsp.results[rsp.results.length-1] : null
        if (lastEvent) {
          if (lastEvent.asset_event_type == 'mint') {
            return lastEvent.tx_id
          } else {
            return await this.queryNFTHistory(contracAddress, contractName, nftName, tokenId, realOffset + 50)
          }
        }
      }
    } catch (err) {
      Utils.alert(`Request server fail, tokenId=${tokenId}, please try again 1 minute later.`)
    }
  },
  async queryAddressNonceInfo(addr) {
    if (!addr) {
      return
    }
    const res = await fetch(`${network.coreApiUrl}/extended/v1/address/${addr}/nonces`)
    if (res.status == 200) {
      const rsp = await res.json()
      return rsp
    }
  },
  openTxInBrowser(txId) {
    if (txId) {
      const url = `https://explorer.hiro.so/txid/${txId}?chain=${getNetType()}`
      window.open(url, '_blank')
    }
  },
}
