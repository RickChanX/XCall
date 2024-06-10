import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet, StacksTestnet, StacksMocknet } from '@stacks/network'

const appConfig = new AppConfig(['store_write', 'publish_data']);

export const userSession = new UserSession({ appConfig });

export function getAppDetails() {
  return {
    name: 'XCall',
    icon: 'https://i.postimg.cc/yxXS7sCJ/XCall.png',
  }
}

export function authenticate() {
  showConnect({
    appDetails: getAppDetails(),
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession: userSession,
  });
}

export function getUserData() {
  return userSession.loadUserData();
}

export function loginIn(failCallback) {
  if (typeof failCallback === 'function') {
    this.$confirm('Sign in first.', 'Tips', {
        confirmButtonText: 'Sign in',
        cancelButtonText: 'No',
        type: 'info',
        center: true,
      }).then(() => {
        authenticate()
      }).catch(() => {
        failCallback()
      });
  } else {
    authenticate()
  }
}

export function loginOut() {
  userSession.signUserOut()
  window.location.reload()
}

//// environment related ///
const netType = 'mainnet'
let network = null
let hiroAPIUrl = null
if (netType == 'mainnet') {
  network = new StacksMainnet()
  hiroAPIUrl = 'https://api.mainnet.hiro.so'
} else if (netType == 'testnet') {
  network = new StacksTestnet()
  hiroAPIUrl = 'https://api.testnet.hiro.so'
} else if (netType == 'devnet') {
  network = new StacksMocknet()
  hiroAPIUrl = 'http://localhost:3999'
}
network.coreApiUrl = hiroAPIUrl

export function getNetType() {
  return netType;
}

export function getNetwork() {
  return network;
}

export function getAddress() {
  if (netType == 'mainnet') {
    return getUserData().profile.stxAddress.mainnet;
  } else {
    return getUserData().profile.stxAddress.testnet;
  }
}
