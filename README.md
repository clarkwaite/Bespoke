# Sales Tracking Application

This is a simple sales tracking application built with React and TypeScript. The application allows users to manage salespersons, products, and customers, track sales, and generate quarterly commission reports.

## Features

- **Salespersons Management**: Add, update, and view salespersons. Ensures no duplicate entries.
- **Products Management**: Add, update, and view products. Ensures no duplicate entries.
- **Customers Management**: Add, update, and view customers. Ensures no duplicate entries.
- **Sales Tracking**: View a list of sales with filtering options by date range. Displays details such as Product, Customer, Date, Price, Salesperson, and Salesperson Commission.
- **Commission Reports**: Generate and view quarterly commission reports for each salesperson based on their sales.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd sales-tracking-app
   ```

3. Install the dependencies:
   ```
   npm install
   ```

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

## Contributing

Feel free to submit issues or pull requests for any improvements or bug fixes.

## License

This project is licensed under the MIT License.