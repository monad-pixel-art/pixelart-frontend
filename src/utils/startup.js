import * as actionCreators from '../store/actions/actionCreators';
import {
  initStorage,
  getDataFromStorage,
  saveProjectToStorage
} from './storage';
import { fetchPixels } from '../services/monadContract';
import buildProjectFromPixels from './blockchainProject';

/*
  Initial actions to dispatch:
  1. Hide spinner
  2. Load a project if there is a current one
*/
const getCurrentProject = dataStored => {
  if (!dataStored) {
    return null;
  }

  const currentProjectIndex = dataStored.current;
  if (typeof currentProjectIndex !== 'number' || currentProjectIndex < 0) {
    return null;
  }

  return dataStored.stored[currentProjectIndex] || null;
};

const loadProjectIntoStore = (dispatch, project) => {
  if (!project) {
    return;
  }

  const { frames, paletteGridData, columns, rows, cellSize } = project;

  dispatch(
    actionCreators.setDrawing(frames, paletteGridData, cellSize, columns, rows)
  );
};

const initialSetup = async (dispatch, storage) => {
  dispatch(actionCreators.showSpinner());

  let dataStored = getDataFromStorage(storage);
  let project = getCurrentProject(dataStored);

  try {
    const pixels = await fetchPixels();
    const blockchainProject = buildProjectFromPixels(pixels, project);

    if (blockchainProject) {
      saveProjectToStorage(storage, blockchainProject);
      project = blockchainProject;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Unable to fetch pixels from Monad contract:', error);
  }

  if (!project) {
    initStorage(storage);
    dataStored = getDataFromStorage(storage);
    project = getCurrentProject(dataStored);
  }

  loadProjectIntoStore(dispatch, project);

  dispatch(actionCreators.hideSpinner());
};

export default initialSetup;
