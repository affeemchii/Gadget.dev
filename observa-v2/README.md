# Observa Analytics Dashboard

A comprehensive Shopify analytics dashboard built with Gadget, React, and Shopify Polaris. This app provides deep insights into store performance, conversion tracking, and checkout optimization metrics.

## 🚀 Features

### 📊 Analytics Dashboard
- **Sessions Analytics**: Track visitor sessions, unique visitors, bounce rates, and page views
- **Orders Analytics**: Monitor orders, revenue, average order value, and refunds
- **Conversion Analytics**: Analyze conversion rates, add-to-cart rates, and checkout initiation
- **Checkout Analytics**: Track checkout completion rates, abandonment rates, and checkout timing

### 🎨 User Experience
- **Attractive Landing Page**: Beautiful introduction with gradient backgrounds and feature cards
- **Responsive Design**: Optimized for all device sizes
- **Loading States**: Spinners and smooth transitions
- **Real-time Updates**: Auto-refresh capabilities for live data
- **Filter Controls**: Date range selection and metric filtering

### 🛠 Technical Features
- **Shopify Native**: Built with Shopify Polaris design system
- **TypeScript**: Full type safety throughout the application
- **Mock Data**: Realistic sample data for demonstration
- **Error Handling**: Comprehensive error boundaries
- **Performance**: Optimized loading states and animations

## 📁 Project Structure

```
web/
├── components/
│   ├── AdaptorLink.tsx          # Link component
│   ├── FullPageSpinner.tsx     # Loading spinner
│   └── NavMenu.tsx             # Navigation menu
├── routes/
│   ├── _app._index.tsx         # Landing page
│   ├── _app.dashboard.tsx      # Main dashboard
│   └── _app.tsx               # App layout
├── api.ts                      # Gadget API client
├── app.css                     # Custom styles
└── root.tsx                    # App root
```

## 🎯 Key Components

### Landing Page (`_app._index.tsx`)
Beautiful landing page with:
- Gradient hero section with app branding
- Feature showcase cards with emojis (📊📦📈🛒)
- Call-to-action buttons to navigate to dashboard
- Responsive design with modern UI elements

### Dashboard (`_app.dashboard.tsx`)
Comprehensive analytics dashboard featuring:
- **Key Metrics Cards**: Total Sessions, Orders, Conversion Rate, Checkout Completion
- **Interactive Tables**: Sessions, Orders, Conversion, and Checkout analytics
- **Smart Filtering**: Date range and metric type selection
- **Loading States**: Spinners and smooth transitions
- **Performance Insights**: Chart placeholders for future visualization
- **Action Items**: Smart recommendations based on data trends

## 🎨 Styling

The app uses custom CSS classes for enhanced visual appeal:

- **Gradient Backgrounds**: Beautiful gradient cards for metrics
- **Hover Effects**: Smooth transitions and hover states
- **Loading Animations**: Shimmer effects for skeleton loaders
- **Responsive Design**: Mobile-first approach with breakpoints
- **Shopify Native**: Consistent with Shopify's design language

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   yarn install
   ```

2. **Start Development Server**
   ```bash
   yarn shopify:dev
   ```

3. **Access the App**
   - Navigate to your Shopify admin
   - Install the app
   - Access the analytics dashboard

## 📊 Data Structure

### Sessions Data
```typescript
interface SessionData {
  id: string;
  date: string;
  sessions: number;
  uniqueVisitors: number;
  bounceRate: string;
}
```

### Orders Data
```typescript
interface OrderData {
  id: string;
  date: string;
  orders: number;
  revenue: string;
  avgOrderValue: string;
}
```

### Conversion Data
```typescript
interface ConversionData {
  id: string;
  date: string;
  conversionRate: string;
  sessions: number;
  orders: number;
}
```

### Checkout Data
```typescript
interface CheckoutData {
  id: string;
  date: string;
  checkoutStarted: number;
  checkoutCompleted: number;
  completionRate: string;
}
```

## 🔄 Future Enhancements

- **Real-time Charts**: Integration with charting libraries
- **Export Functionality**: CSV/PDF export capabilities
- **Advanced Filtering**: More granular filter options
- **Custom Date Ranges**: Date picker for custom ranges
- **Performance Alerts**: Automated performance notifications
- **Multi-store Support**: Analytics across multiple stores
- **Shopify GraphQL Integration**: Real data from Shopify API

## 🛡️ Security & Performance

- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive error boundaries
- **Loading States**: Optimized user experience
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliant components

## 📝 License

This project is licensed under the UNLICENSED license - see the package.json file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions, please refer to the Gadget documentation or create an issue in the repository.

---

Built with ❤️ using Gadget, React, TypeScript, and Shopify Polaris.
