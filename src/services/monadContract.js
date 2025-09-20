import { getReadOnlyWeb3Instance, getWeb3Instance } from './web3Provider';

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
  },
  {
    constant: true,
    inputs: [],
    name: 'getPixels',
    outputs: [
      { internalType: 'uint256[]', name: 'x', type: 'uint256[]' },
      { internalType: 'uint256[]', name: 'y', type: 'uint256[]' },
      { internalType: 'uint8[][]', name: 'colors', type: 'uint8[][]' }
    ],
    payable: false,
    stateMutability: 'view',
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

export const createReadContract = web3Instance =>
  new web3Instance.eth.Contract(DRAW_CONTRACT_ABI, MONAD_DRAW_CONTRACT_ADDRESS);

export const parsePixelsResult = result => {
  if (Array.isArray(result)) {
    const [x, y, colors] = result;
    return { x, y, colors };
  }

  return {
    x: result.x || [],
    y: result.y || [],
    colors: result.colors || []
  };
};

export const fetchPixels = async (web3Instance = getReadOnlyWeb3Instance()) => {
  const web3 = web3Instance;

  if (!web3) {
    throw new Error('Unable to create Web3 instance for read operations.');
  }

  const contract = createReadContract(web3);
  const result = await contract.methods.getPixels().call();
  return parsePixelsResult(result);
};
