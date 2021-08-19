/**
 * This file is part of CubeArtisan.
 *
 * CubeArtisan is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CubeArtisan is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with CubeArtisan.  If not, see <https://www.gnu.org/licenses/>.
 *
 * Modified from the original version in CubeCobra. See LICENSE.CubeCobra for more information.
 */
import React, { createContext, useCallback, useState } from 'react';
import PropTypes from 'prop-types';

const DisplayContext = createContext({
  showCustomImages: true,
  compressedView: false,
  showMaybeboard: false,
  cardsInRow: 4,
});

export const DisplayContextProvider = ({ cubeID, defaultNumCols, ...props }) => {
  const [showCustomImages, setShowCustomImages] = useState(true);
  const toggleShowCustomImages = useCallback(() => {
    setShowCustomImages(!showCustomImages);
  }, [showCustomImages]);

  const [compressedView, setCompressedView] = useState(() => {
    return typeof localStorage !== 'undefined' && localStorage.getItem('compressed') === 'true';
  });
  const toggleCompressedView = useCallback(() => {
    localStorage.setItem('compressed', !compressedView);
    setCompressedView(!compressedView);
  }, [compressedView]);

  const [showMaybeboard, setShowMaybeboard] = useState(() => {
    return typeof localStorage !== 'undefined' && cubeID && localStorage.getItem(`maybeboard-${cubeID}`) === 'true';
  });
  const toggleShowMaybeboard = useCallback(() => {
    if (cubeID) localStorage.setItem(`maybeboard-${cubeID}`, !showMaybeboard);
    setShowMaybeboard(!showMaybeboard);
  }, [cubeID, showMaybeboard]);

  const [cardsInRow, setCardsInRow] = useState(
    () => (typeof localStorage !== 'undefined' && localStorage.getItem('cardsInRow')) || defaultNumCols,
  );
  const updateCardsInRow = useCallback((newCardsInRow) => {
    localStorage.setItem('cardsInRow', newCardsInRow);
    setCardsInRow(newCardsInRow);
  }, []);

  const value = {
    showCustomImages,
    toggleShowCustomImages,
    compressedView,
    toggleCompressedView,
    showMaybeboard,
    toggleShowMaybeboard,
    cardsInRow,
    setCardsInRow: updateCardsInRow,
  };
  return <DisplayContext.Provider value={value} {...props} />;
};
DisplayContextProvider.propTypes = {
  cubeID: PropTypes.string.isRequired,
  defaultNumCols: PropTypes.number,
};
DisplayContextProvider.defaultProps = {
  defaultNumCols: 4,
};
export default DisplayContext;
