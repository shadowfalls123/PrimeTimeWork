import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ExamPaperTiles from '../components/ExamPaperTiles';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // Import ThemeProvider and createTheme from Material-UI

jest.mock('../services', () => ({
  getTopRatedPapers: jest.fn(() =>
    Promise.resolve([
      {
        examdesc: 'IIT JEE 1999',
        paperprice: '2',
        paperid: '01K7NK342S02K59DWNXASO4BE0',
        examtitle: 'IIT JEE 1999',
        paperrating: 0,
      },
      // Add more mock data if needed
    ])
  ),
}));

const mockStore = configureStore([]);
//const initialState = {}; // Replace with your initial state if needed
const initialState = {
  items: [],
  totalPrice: 0,
};
const store = mockStore(initialState);
const theme = createTheme(); // Create a default theme

describe('ExamPaperTiles component', () => {
  // it('renders loading indicator initially', async () => {
  //   render(
  //     <Provider store={store}>
  //       <ThemeProvider theme={theme}> {/* Provide the theme to the component */}
  //         <ExamPaperTiles />
  //       </ThemeProvider>
  //     </Provider>
  //   );
  //   expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  //   await waitFor(() => {
  //     expect(screen.queryByTestId('loading-indicator')).toBeNull();
  //   });
  // });

  it('renders papers correctly', async () => {
    render(
      <Provider store={store}>
                <ThemeProvider theme={theme}> {/* Provide the theme to the component */}
          <ExamPaperTiles />
        </ThemeProvider>
      </Provider>
    );
    await waitFor(() => {
      const elementsWithText = screen.queryAllByText('IIT JEE 1999');
      expect(elementsWithText.length).toBeGreaterThan(0); // Assert that at least one element contains the text

//      expect(screen.getByText('IIT JEE 1999')).toBeInTheDocument();
//      expect(screen.getByText('by John Doe')).toBeInTheDocument();
//      expect(screen.queryByText('Papers not available.')).not.toBeInTheDocument();
    });
  });

  // it('displays a snackbar on failed paper fetch', async () => {
  //   jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error in the test

  //   jest.mock('../services', () => ({
  //     getTopRatedPapers: jest.fn(() => Promise.reject('Error fetching papers')),
  //   }));

  //   render(
  //     <Provider store={store}>
  //               <ThemeProvider theme={theme}> {/* Provide the theme to the component */}
  //         <ExamPaperTiles />
  //       </ThemeProvider>
  //     </Provider>
  //   );
  //   await waitFor(() => {
  //     expect(screen.getByText('Failed to fetch top-rated papers')).toBeInTheDocument();
  //   });
  // });

  it('adds paper to cart on button click', async () => {
    render(
      <Provider store={store}>
                <ThemeProvider theme={theme}> {/* Provide the theme to the component */}
          <ExamPaperTiles />
        </ThemeProvider>
      </Provider>
    );
    await waitFor(() => {
      const addToCartButton = screen.getByText('Add to cart');
      userEvent.click(addToCartButton);
      // Add your assertions for cart functionality
    });
  });
});
