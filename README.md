# Today Egg Rates - Food Price App

[![Website](https://img.shields.io/website?url=https%3A%2F%2Ftodayeggrates.com&label=Production)](https://todayeggrates.com)

A comprehensive platform for tracking egg prices across cities and states in India. This project combines React for the frontend and PHP for backend APIs.

![Today Egg Rates](./public/eggpic.png)

## 🌟 Features

- Real-time egg price tracking across Indian cities
- Historical price data and trends analysis
- City and state-specific egg rate information
- AMP Web Stories for mobile-optimized content
- Educational blog content about egg markets
- Admin dashboard for data management

## 🗂️ Project Structure

The project is organized into frontend (React) and backend (PHP) components:

```
food-price-app/
├── src/                  # React frontend source files
├── public/               # Static public assets
│   ├── images/           # Image assets including webstory thumbnails
│   ├── php/              # PHP backend files
│   │   ├── api/          # API endpoints for data operations
│   │   ├── config/       # Configuration files
│   │   ├── cron/         # Automated task scripts
│   │   └── webstories/   # Web story generation scripts
│   ├── templates/        # HTML templates
│   └── webstories/       # Generated web stories
├── build/                # Production build output
└── reports/              # Analytics and performance reports
```

For detailed documentation:
- [Frontend Documentation](./documentation.md)
- [PHP API Documentation](./php%20docs.md)

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- PHP (v7.4+)
- MySQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/food-price-app.git
cd food-price-app
```

2. Install dependencies
```bash
npm install
```

3. Configure database
   - Create a MySQL database
   - Update `public/php/config/db.php` with your database credentials

4. Start development server
```bash
npm start
```

## 📝 Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## 🔄 Data Update Process

The application fetches egg prices from various sources including:
- National Egg Coordination Committee (NECC) website
- Direct API submissions from market reporters
- Administrative updates through the CMS

Data is automatically refreshed through scheduled cron jobs:

```bash
# Schedule daily updates (typically set on server)
0 9 * * * php /path/to/public/php/cron/cronjob.php
```

## 🌐 Deployment

The site is deployed at [Today Egg Rates](https://todayeggrates.com).

Deploy your own instance:

1. Build the React application
```bash
npm run build
```

2. Upload the build directory contents to your web server
3. Ensure PHP and MySQL are properly configured
4. Set up cron jobs for automatic data updates

## 📊 Analytics

Performance and user engagement data can be found in the `reports/` directory.

## 📄 License

This project is proprietary and not open for redistribution or use without permission.

## 📞 Contact

For questions or support, contact us at info@todayeggrates.com
