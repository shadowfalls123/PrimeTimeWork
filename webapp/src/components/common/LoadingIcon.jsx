import React from 'react';
import { css } from '@emotion/react';
import { ClipLoader, BeatLoader, PulseLoader, RingLoader } from 'react-spinners';

const override = css`
  display: block;
  margin: 0 auto;
`;

export const ClipLoadingIcon = () => (
  <div className="loading-icon">
    <ClipLoader color="#000000" css={override} size={50} />
  </div>
);

export const BeatLoadingIcon = () => (
  <div className="loading-icon">
    <BeatLoader color="#000000" css={override} size={15} />
  </div>
);

export const PulseLoadingIcon = () => (
  <div className="loading-icon">
    <PulseLoader color="#000000" css={override} size={10} />
  </div>
);

export const RingLoadingIcon = () => (
  <div className="loading-icon">
    <RingLoader color="#000000" css={override} size={40} />
  </div>
);


// import React from 'react';

// const LoadingIcon = () => {
//   return (
//     <div className="loading-icon">
//       {/* Add your loading icon elements or styles here */}
//       Loading...
//     </div>
//   );
// };

// export default LoadingIcon;