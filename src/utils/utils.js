import { ElMessageBox } from 'element-plus'
import { ElMessage } from 'element-plus'
import { standardPrincipalCV, contractPrincipalCV } from '@stacks/transactions'

export const Utils = {
  alert(msg, userData) {
    if (!userData) {
      userData = {}
    }
    ElMessageBox.alert(msg, userData.title, {
      confirmButtonText: userData.btnText ? userData.btnText : 'Ok',
      dangerouslyUseHTMLString: true,
    })
  },
  tip(msg, tipType) {
    ElMessage({message: msg, type: tipType})
  },
  tipOk(msg, userData) {
    ElMessage({message: msg, type: 'success'})
  },
  tipErr(msg) {
    ElMessage({message: msg, type: 'error'})
  },
  alertInvalidAddress() {
    this.alert('Address invalid')
  },
  buffer2Str(hex) {
    // return Buffer.from(v.value.substring(2), 'hex').toString()
    if (hex.startsWith('0x')) {
      hex = hex.substr(2)
    }
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      const hexValue = hex.substr(i, 2);
      const decimalValue = parseInt(hexValue, 16);
      str += String.fromCharCode(decimalValue);
    }
    return str;
  },
  trimLower(s) {
    if (s) {
      return s.trim().toLowerCase()
    }
    return s
  },
  parseAddress(addr) {
    if (!addr || addr.trim().length <= 0) {
      return null
    }
    try {
      const pList = addr.trim().split('.')
      if (pList.length == 1) {
        const pv = standardPrincipalCV(pList[0])
        return pv
      } else {
        const pv = contractPrincipalCV(pList[0], pList[1])
        return pv
      }
    } catch (err) {
      return null
    }
  },
  thousandNumStr(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+$)/g,'$1,')
  },
  sip10BalanceToStr(sip10V) {
    if (sip10V.length < 7) {
      sip10V = '0.' + '0'.repeat(6 - sip10V.length) + sip10V
    } else {
      sip10V = sip10V.substring(0, sip10V.length - 6) + '.' + sip10V.substring(sip10V.length - 6)
    }
    while (sip10V.endsWith('0') && sip10V.length > 1) {
      sip10V = sip10V.substring(0, sip10V.length - 1)
    }
    if (sip10V.endsWith('.')) {
      sip10V = sip10V.substring(0, sip10V.length - 1)
    }
    return sip10V
  },
  // convert Blob to Base64
  blobToBase64(blob, callback) {
    const reader = new FileReader();
    reader.onload = function () {
        const dataUrl = reader.result;
        const base64 = dataUrl.split(',')[1];
        callback(base64);
    };
    reader.readAsDataURL(blob);
  },
  // convert Base64 to Blob
  base64ToBlob(base64, type) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: type });
  }
}
