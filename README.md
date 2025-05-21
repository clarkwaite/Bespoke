# Sales Tracking Application

This is a simple sales tracking application built with React and TypeScript. The application allows users to manage salespersons, products, and customers, track sales, and generate quarterly commission reports.

## Features

- **Salespersons Management**: Add, update, view, and delete salespersons. Ensures no duplicate entries.
- **Products Management**: Add, update, view, and delete products. Ensures no duplicate entries.
- **Customers Management**: Add, update, view, and delete customers.
- **Sales Tracking**: Add to and view a list of sales with filtering options by date range.
- **Commission Reports**: View quarterly commission reports for each salesperson based on their sales.

## Features I Would Have Liked To Complete With More Time

- **Pagination**: Currently the data is small, but without pagination this app does not scale very well.
- **Third party table library**: Something like react-table or similar. This would have a lot of features like sorting by columns under the hood.
- **Fuller test coverage**: Tests take a lot of time to write. I was able to test the helper functions, but was unable to fully test all of the integration tests in the larger components. 

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher)

### Running the Application

To start the application in development mode, run:
```
npm start
```

The application will be available at `http://localhost:3000`.

### Building for Production

To create a production build, run:
```
npm run build
```

This will generate a `build` folder with the optimized application.
