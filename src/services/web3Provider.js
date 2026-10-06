import Web3 from 'web3';

let web3Instance = null;

export const getWeb3 = () => {
  if (web3Instance) return web3Instance;
  if (window.ethereum) {
    web3Instance = new Web3(window.ethereum);
    return web3Instance;
  }
  throw new Error("MetaMask is not installed");
};