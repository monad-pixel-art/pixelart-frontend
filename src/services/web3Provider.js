import Web3 from 'web3';

let web3Instance = null;
let readOnlyWeb3Instance = null;

export const MONAD_TESTNET_RPC_URL =
  process.env.REACT_APP_MONAD_TESTNET_RPC_URL ||
  'https://testnet-rpc.monad.xyz/';

const getWindow = () => (typeof window !== 'undefined' ? window : undefined);

export const getEthereumProvider = () => {
  const localWindow = getWindow();
  if (!localWindow) {
    return null;
  }

  if (localWindow.ethereum) {
    return localWindow.ethereum;
  }

  if (localWindow.web3 && localWindow.web3.currentProvider) {
    return localWindow.web3.currentProvider;
  }

  return null;
};

export const getWeb3Instance = () => {
  const provider = getEthereumProvider();
  if (!provider) {
    return null;
  }

  if (!web3Instance) {
    web3Instance = new Web3(provider);
  }

  return web3Instance;
};

export const getReadOnlyWeb3Instance = () => {
  if (readOnlyWeb3Instance) {
    return readOnlyWeb3Instance;
  }

  const provider = getEthereumProvider();
  if (provider) {
    readOnlyWeb3Instance = new Web3(provider);
    return readOnlyWeb3Instance;
  }

  readOnlyWeb3Instance = new Web3(MONAD_TESTNET_RPC_URL);
  return readOnlyWeb3Instance;
};

export const connectWeb3 = async () => {
  const provider = getEthereumProvider();

  if (!provider) {
    throw new Error(
      'No Ethereum wallet detected. Install MetaMask or a compatible wallet.'
    );
  }

  let accounts = [];

  if (provider.request) {
    accounts = await provider.request({ method: 'eth_requestAccounts' });
  } else {
    const web3 = getWeb3Instance();
    accounts = await web3.eth.getAccounts();
  }

  const web3 = getWeb3Instance();

  if (!accounts || accounts.length === 0) {
    throw new Error(
      'Wallet connected but no account is available. Unlock the wallet and try again.'
    );
  }

  return { web3, accounts };
};

export const formatAddress = value => {
  if (!value) {
    return '';
  }

  const prefixLength = 6;
  const suffixLength = 4;

  return `${value.slice(0, prefixLength)}…${value.slice(-suffixLength)}`;
};
