import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
  },
});

export default theme;








// // See https://stackoverflow.com/a/64135466

// //import { unstable_createMuiStrictModeTheme as createMuiTheme } from '@material-ui/core';
// //import { createMuiTheme } from '@material-ui/core/styles';

// import { createTheme } from '@material-ui/core/styles';

// const theme = createTheme({
//   spacing: 6,
//   typography: {
//     fontSize: 13,
//     fontWeightLight: 300,
//     fontWeightRegular: 400,
//     fontWeightMedium: 500,
//     fontWeightBold: 600,
//     h1: {
//       fontSize: '2rem',
//       fontWeight: 600,
//       lineHeight: 1.25,
//     },
//     h2: {
//       fontSize: '1.75rem',
//       fontWeight: 600,
//       lineHeight: 1.25,
//     },
//     h3: {
//       fontSize: '1.5rem',
//       fontWeight: 600,
//       lineHeight: 1.25,
//     },
//     h4: {
//       fontSize: '1.125rem',
//       fontWeight: 500,
//       lineHeight: 1.25,
//     },
//     h5: {
//       fontSize: '1.0625rem',
//       fontWeight: 500,
//       lineHeight: 1.25,
//     },
//     h6: {
//       fontSize: '1rem',
//       fontWeight: 500,
//       lineHeight: 1.25,
//     },
//     body1: {
//       fontSize: 13,
//     },
//     button: {
//       textTransform: 'none',
//     },
//   },
// });

// export default theme;
