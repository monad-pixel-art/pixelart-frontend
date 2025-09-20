import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import shortid from 'shortid';
import * as actionCreators from '../store/actions/actionCreators';
import { getDataFromStorage, saveProjectToStorage } from '../utils/storage';
import diffFramePixels from '../utils/pixelDiff';
import { connectWeb3 } from '../services/web3Provider';
import {
  getMonadDrawContract,
  MONAD_TESTNET_CHAIN_ID
} from '../services/monadContract';

const SaveDrawing = props => {
  const [isSaving, setIsSaving] = useState(false);
  const {
    actions,
    frames,
    paletteGridData,
    cellSize,
    columns,
    rows,
    activeFrameIndex
  } = props;

  const save = async () => {
    if (isSaving) {
      return;
    }

    const framesAsJs = frames.toJS();
    const paletteAsJs = paletteGridData.toJS();
    const drawingToSave = {
      frames: framesAsJs,
      paletteGridData: paletteAsJs,
      cellSize,
      columns,
      rows,
      animate: framesAsJs.length > 1,
      id: shortid.generate()
    };

    try {
      setIsSaving(true);

      const storageData = getDataFromStorage(localStorage);
      const previousProject =
        storageData && storageData.current >= 0
          ? storageData.stored[storageData.current]
          : null;

      const previousFrame =
        previousProject && Array.isArray(previousProject.frames)
          ? previousProject.frames[activeFrameIndex]
          : null;

      const currentFrame = framesAsJs[activeFrameIndex];

      if (!currentFrame || !Array.isArray(currentFrame.grid)) {
        throw new Error('Active frame data is unavailable. Try again.');
      }

      const diff = diffFramePixels({
        previousGrid: previousFrame ? previousFrame.grid : null,
        nextGrid: currentFrame.grid,
        columns,
        rows
      });

      if (diff.xs.length > 0) {
        const { web3, accounts } = await connectWeb3();
        const account = accounts && accounts[0];

        if (!account) {
          throw new Error(
            'Wallet account unavailable. Unlock your wallet and try again.'
          );
        }

        const chainId = await web3.eth.getChainId();
        console.log('Connected chainId:', chainId);
        if (Number(chainId) !== MONAD_TESTNET_CHAIN_ID) {
          throw new Error(
            'Switch your wallet network to Monad Testnet (chainId 10143) before saving.'
          );
        }

        const contract = getMonadDrawContract(web3);
        await contract.methods
          .drawPixelsBatch(diff.xs, diff.ys, diff.colors)
          .send({ from: account });
      }

      if (saveProjectToStorage(localStorage, drawingToSave)) {
        const notificationMessage =
          diff.xs.length > 0
            ? 'Drawing synced to Monad.'
            : 'Drawing saved (no pixel changes).';
        actions.sendNotification(notificationMessage);
      } else {
        actions.sendNotification('Unable to store drawing locally.');
      }
    } catch (error) {
      actions.sendNotification(error?.message || 'Unable to save drawing.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="save-drawing">
      <button type="button" onClick={save} disabled={isSaving}>
        {isSaving ? 'SAVING…' : 'SAVE'}
      </button>
    </div>
  );
};

const mapStateToProps = state => {
  const frames = state.present.get('frames');
  return {
    frames: frames.get('list'),
    columns: frames.get('columns'),
    rows: frames.get('rows'),
    cellSize: state.present.get('cellSize'),
    paletteGridData: state.present.getIn(['palette', 'grid']),
    activeFrameIndex: frames.get('activeIndex')
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

const SaveDrawingContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SaveDrawing);
export default SaveDrawingContainer;
