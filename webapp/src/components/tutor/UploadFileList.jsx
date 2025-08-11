import React from "react";
import { Box, Typography } from '@mui/material';
import UploadFile from './UploadFile';

const UploadFileList = () => {
  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', py: 8 }}>
      <Typography variant="h2" align="center">
      <UploadFile />
      </Typography>
    </Box>
  );
};

export default UploadFileList;


// import React from 'react';
// import { makeStyles, useTheme } from '@material-ui/core/styles';

// import UploadFile from '../components/UploadFile';
// //import DocumentsTable from '../components/DocumentsTable';
// import Page from '../containers/Page';

// const useStyles = makeStyles((theme) => ({
//   root: {
//     padding: theme.spacing(5),
//   },
//   title: {
//     marginBottom: theme.spacing(5),
//   },
//   datagrid: {
//     flexGrow: 1,
//   },
// }));

// function UploadFileList() {
//   const theme = useTheme();
//   const classes = useStyles(theme);
//   return (
//     <Page title="Documents">
//       <UploadFile className={classes.datagrid} />
//     </Page>
//   );
// }

// export default UploadFileList;
