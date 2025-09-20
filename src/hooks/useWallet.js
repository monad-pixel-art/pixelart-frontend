import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  connectWeb3,
  formatAddress,
  getEthereumProvider,
  getWeb3Instance
} from '../services/web3Provider';

const emptyAccounts = [];

const normalizeChainId = value => {
  if (!value && value !== 0) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  return `0x${Number(value).toString(16)}`;
};

const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const provider = useMemo(() => getEthereumProvider(), []);

  const handleAccountsChanged = useCallback((accounts = emptyAccounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setErrorMessage(null);
    } else {
      setAccount(null);
    }
  }, []);

  const handleChainChanged = useCallback(newChainId => {
    setChainId(normalizeChainId(newChainId));
  }, []);

  const resolveChainId = useCallback(async () => {
    const web3 = getWeb3Instance();
    if (!web3) {
      return;
    }

    try {
      const id = await web3.eth.getChainId();
      handleChainChanged(id);
    } catch (error) {
      // Ignore chain resolution errors to keep the UI responsive.
    }
  }, [handleChainChanged]);

  const connect = useCallback(async () => {
    setErrorMessage(null);

    if (!provider) {
      setErrorMessage(
        'No Ethereum wallet detected. Install MetaMask or a compatible wallet.'
      );
      return;
    }

    setIsConnecting(true);

    try {
      const { accounts } = await connectWeb3();
      handleAccountsChanged(accounts);

      if (provider.request) {
        const currentChainId = await provider.request({
          method: 'eth_chainId'
        });
        handleChainChanged(currentChainId);
      } else {
        await resolveChainId();
      }
    } catch (error) {
      if (error && error.code === 4001) {
        setErrorMessage('Wallet connection request was rejected.');
      } else {
        setErrorMessage(error?.message || 'Unable to connect wallet.');
      }
    } finally {
      setIsConnecting(false);
    }
  }, [handleAccountsChanged, handleChainChanged, provider, resolveChainId]);

  useEffect(() => {
    if (!provider) {
      return undefined;
    }

    if (provider.request) {
      provider
        .request({ method: 'eth_accounts' })
        .then(handleAccountsChanged)
        .catch(() => {});

      provider
        .request({ method: 'eth_chainId' })
        .then(handleChainChanged)
        .catch(() => {});
    } else {
      const web3 = getWeb3Instance();
      if (web3) {
        web3.eth
          .getAccounts()
          .then(handleAccountsChanged)
          .catch(() => {});

        resolveChainId();
      }
    }

    const accountsChangedHandler = accounts => handleAccountsChanged(accounts);
    const chainChangedHandler = id => handleChainChanged(id);

    if (provider.on) {
      provider.on('accountsChanged', accountsChangedHandler);
      provider.on('chainChanged', chainChangedHandler);
    }

    return () => {
      if (provider.removeListener) {
        provider.removeListener('accountsChanged', accountsChangedHandler);
        provider.removeListener('chainChanged', chainChangedHandler);
      }
    };
  }, [handleAccountsChanged, handleChainChanged, provider, resolveChainId]);

  return {
    account,
    chainId,
    connect,
    errorMessage,
    hasProvider: Boolean(provider),
    isConnecting,
    shortenedAddress: formatAddress(account)
  };
};

export default useWallet;
