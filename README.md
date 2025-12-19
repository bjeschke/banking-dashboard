# Banking Dashboard

A simple banking dashboard built with React and TypeScript. 
It lets you track deposits and withdrawals, see your current balance, and filter through your transaction history.

## Features

- **Balance Overview** - Shows your current account balance along with total income and expenses
- **Transaction Management** - Add deposits and withdrawals with descriptions and categories
- **Filtering** - Search transactions by description, filter by type, or narrow down by date range
- **Undo Support** You can undo your last action
- **CSV Import/Export** - Bring in your existing data or export everything for backup
- **Dark Mode**
- **KES Conversion** - Automatically shows amounts in Kenyan Shillings using live exchange rates
- **Persistent Storage** - Your data is saved in localStorage, so it survives page refreshes

## Getting Started

First, make sure you have Node.js installed on your machine.

Then navigate into the project folder and install the dependencies:

```bash
cd banking-dashboard
npm install
```

To start the development server:

```bash
npm start
```

The app should now be running at http://localhost:3000

## Running Tests

```bash
npm test
```

Or if you want to watch for changes:

```bash
npm run test:watch
```

For coverage reports:

```bash
npm run test:coverage
```

## Building for Production

```bash
npm run build
```

This creates an optimized build in the `build` folder.

## Tech Stack

- React 19
- TypeScript
- Jest for testing
- CSS custom properties for theming
