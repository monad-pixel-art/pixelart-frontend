import React from 'react';
import useWallet from '../hooks/useWallet';

const WalletButton = () => {
  const {
    account,
    chainId,
    connect,
    errorMessage,
    hasProvider,
    isConnecting,
    shortenedAddress
  } = useWallet();

  const renderLabel = () => {
    if (!hasProvider) {
      return 'Install Wallet';
    }

    if (account) {
      return `Wallet: ${shortenedAddress}`;
    }

    if (isConnecting) {
      return 'Connecting…';
    }

    return 'Connect Wallet';
  };

  const buttonClassName = account
    ? 'app__wallet-button app__wallet-button--connected'
    : 'app__wallet-button';

  return (
    <div className="app__wallet">
      <button
        type="button"
        className={buttonClassName}
        disabled={isConnecting || !hasProvider}
        onClick={connect}
      >
        {renderLabel()}
      </button>
      {account && chainId && (
        <p className="app__wallet-network">
          <span className="app__wallet-network-label">Network:</span>
          <span className="app__wallet-network-value">{chainId}</span>
        </p>
      )}
      {errorMessage && (
        <p className="app__wallet-error" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default WalletButton;
