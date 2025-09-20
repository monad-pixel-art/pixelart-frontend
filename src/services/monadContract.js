import { getWeb3Instance } from './web3Provider';

export const MONAD_TESTNET_CHAIN_ID = 10143;

export const MONAD_DRAW_CONTRACT_ADDRESS =
  process.env.REACT_APP_MONAD_DRAW_CONTRACT_ADDRESS ||
  '0x0000000000000000000000000000000000000000';

const DRAW_CONTRACT_ABI = [
  {
    constant: false,
    inputs: [
      { internalType: 'uint256[]', name: 'x', type: 'uint256[]' },
      { internalType: 'uint256[]', name: 'y', type: 'uint256[]' },
      { internalType: 'uint8[][]', name: 'colors', type: 'uint8[][]' }
    ],
    name: 'drawPixelsBatch',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

export const getMonadDrawContract = (web3Instance = getWeb3Instance()) => {
  const web3 = web3Instance;

  if (!web3) {
    throw new Error('Web3 instance is not available. Connect a wallet first.');
  }

  return new web3.eth.Contract(DRAW_CONTRACT_ABI, MONAD_DRAW_CONTRACT_ADDRESS);
};
