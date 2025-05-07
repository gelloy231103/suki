import React, { useState } from 'react';

// Mock transaction data
const transactionData = [
  {
    id: 1,
    type: 'Online Payment - Link and Pay',
    amount: -339.00,
    date: 'May 6, 2025',
    time: '9:01 PM',
    reference: '970822921',
    recipient: 'Grab Philippines',
    details: 'Payment to Grab Philippines'
  },
  {
    id: 2,
    type: 'Withdrawal',
    amount: 500.00,
    date: 'May 6, 2025',
    time: '9:01 PM'
  },
  {
    id: 3,
    type: 'Online Payment - Web Pay',
    amount: -1615.31,
    date: 'May 6, 2025',
    time: '8:39 PM'
  },
  {
    id: 4,
    type: 'Deposit',
    amount: -1400.00,
    date: 'May 5, 2025',
    time: '9:38 PM'
  },
  {
    id: 5,
    type: 'Cashin from CIMB Philippines',
    amount: 2000.00,
    date: 'May 5, 2025',
    time: '11:10 AM'
  },
  {
    id: 6,
    type: 'ATM Withdrawal',
    amount: -918.00,
    date: 'May 5, 2025',
    time: '8:44 AM'
  },
];

// Vegetable data for the home screen
const vegetableData = [
  {
    id: 1,
    name: 'Sweet Tomatoes',
    price: 40,
    image: '/api/placeholder/80/80',
    source: 'Italhani Farmville',
    reviews: 154,
    rating: 4.8
  },
  {
    id: 2,
    name: 'Biggest Eggplant',
    price: 80,
    image: '/api/placeholder/80/80',
    source: 'Italhani Farm and Restaurant',
    reviews: 154,
    rating: 4.8
  },
  {
    id: 3,
    name: 'Broccolicious',
    price: 40,
    image: '/api/placeholder/80/80',
    source: 'Italhani Farm and Grill',
    reviews: 154,
    rating: 4.8
  },
  {
    id: 4,
    name: 'Lettuce Baguio',
    price: 35,
    image: '/api/placeholder/80/80',
    source: 'Italhani Farm and Oak',
    reviews: 154,
    rating: 4.6
  },
  {
    id: 5,
    name: 'Sweet Tomatoes',
    price: 38,
    image: '/api/placeholder/80/80',
    source: 'Italhani Farm Villa',
    reviews: 154,
    rating: 4.7
  }
];

// Categories for filter chips
const categories = [
  "leafy greens",
  "broccoli",
  "cauliflower",
  "spinach",
  "carrots"
];

const TransactionDetailsScreen = ({ transaction, onBack }) => {
  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-green-500 py-4 px-4 flex items-center">
        <button
          onClick={onBack}
          className="mr-4 text-white text-2xl font-bold"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-white">Transaction Details</h1>
      </div>

      <div className="flex flex-col items-center p-4">
        <div className="mt-8 mb-6 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <div className="text-blue-500 text-2xl">📄</div>
        </div>

        <h2 className="text-xl font-bold mb-6 text-center">
          {transaction.details || transaction.type}
        </h2>

        <div className="flex justify-between w-full py-4 border-b border-gray-200">
          <span className="text-gray-500">Amount</span>
          <span className={transaction.amount < 0 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
            {transaction.amount < 0 ? '' : '+'}{transaction.amount.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between w-full py-4 border-b border-gray-200">
          <span className="text-gray-500">Date & Time</span>
          <span className="text-gray-800 font-medium">{transaction.date} {transaction.time}</span>
        </div>

        {transaction.reference && (
          <div className="flex justify-between w-full py-4 border-b border-gray-200">
            <span className="text-gray-500">Reference Number</span>
            <span className="text-gray-800 font-medium">{transaction.reference}</span>
          </div>
        )}

        <div className="mt-8">
          <a href="#" className="text-blue-500">Need help? Go to Help Center</a>
        </div>
      </div>
    </div>
  );
};

const TransactionHistoryScreen = ({ onBack, onTransactionPress }) => {
  // Group transactions by date
  const groupedTransactions = {};

  transactionData.forEach(transaction => {
    if (!groupedTransactions[transaction.date]) {
      groupedTransactions[transaction.date] = [];
    }
    groupedTransactions[transaction.date].push(transaction);
  });

  // Get unique dates
  const dates = Object.keys(groupedTransactions);

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-green-500 py-4 px-4 flex items-center">
        <button
          onClick={onBack}
          className="mr-4 text-white text-2xl font-bold"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-white">Transaction History</h1>
      </div>

      <div className="p-4 bg-gray-100 border-b border-gray-200">
        <h2 className="text-gray-800">As of May 7, 2025</h2>
      </div>

      <div className="flex-1 overflow-auto">
        {dates.map((date, index) => (
          <div key={index}>
            <h3 className="px-4 pt-4 pb-2 font-bold text-lg text-gray-800">
              {date === 'May 6, 2025' ? 'Yesterday' : date}
            </h3>

            {groupedTransactions[date].map(transaction => (
              <button
                key={transaction.id}
                className="flex justify-between items-center w-full p-4 border-b border-gray-200 hover:bg-gray-50"
                onClick={() => onTransactionPress(transaction)}
              >
                <div className="text-left">
                  <div className="text-gray-500 text-sm mb-1">{transaction.time}</div>
                  <div className="text-gray-800 font-medium">{transaction.type}</div>
                </div>
                <div className={transaction.amount < 0 ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                  {transaction.amount < 0 ? '' : '+'}{transaction.amount.toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const VegetableItem = ({ item, isList }) => {
  return (
    <div className={`flex ${isList ? 'flex-row' : 'flex-col'} border-b border-gray-200 p-2 relative`}>
      <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg" />

      <div className={`${isList ? 'ml-3' : 'mt-2'} flex-1`}>
        <div className="font-bold text-gray-800">{item.name}</div>
        <div className="text-green-500 font-semibold">₱{item.price}/kg</div>
        <div className="text-yellow-500 text-xs">★★★★☆ {item.reviews} reviews</div>
        <div className="text-gray-500 text-xs">{item.source}</div>
      </div>

      <button className="absolute right-2 bottom-2 w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
        <span className="text-green-500 text-xl">♡</span>
      </button>
    </div>
  );
};

const HomeScreen = ({ onTransactionsPress }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-green-500">Suki</h1>
          <div className="w-4 h-6 bg-green-500 ml-1"></div>
        </div>
        <div className="flex">
          <button className="mx-2 text-2xl">📷</button>
          <button onClick={onTransactionsPress} className="mx-2 text-2xl">📊</button>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-gray-100 rounded-full p-3 flex items-center">
          <span className="mr-2">🔍</span>
          <span className="text-gray-400">Search</span>
        </div>
      </div>

      <div className="flex overflow-x-auto px-2 pb-2">
        {categories.map((category, index) => (
          <button
            key={index}
            className={`px-3 py-2 mx-1 rounded-full text-sm ${
              selectedCategory === category
                ? 'bg-green-500 text-white'
                : 'bg-green-50 text-green-500'
            }`}
            onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mx-4 my-4 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-lg font-bold text-gray-700">Commercial</span>
      </div>

      <div className="flex justify-between items-center px-4 py-2">
        <h2 className="text-lg font-bold text-gray-800">Flash Deals</h2>
        <a href="#" className="text-green-500 font-medium">View All</a>
      </div>

      <div className="flex px-4 overflow-x-auto pb-4">
        <div className="w-32 h-32 bg-gray-200 rounded-lg mr-3"></div>
        <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
      </div>

      <div className="px-4 py-2">
        <h2 className="text-lg font-bold text-gray-800">Browse</h2>
      </div>

      <div className="flex-1 overflow-auto">
        {vegetableData.map(item => (
          <VegetableItem key={item.id} item={item} isList={true} />
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleTransactionPress = (transaction) => {
    setSelectedTransaction(transaction);
    setCurrentScreen('transactionDetails');
  };

  const navigateToHome = () => {
    setCurrentScreen('home');
  };

  const navigateToTransactions = () => {
    setCurrentScreen('transactions');
  };

  return (
    <div className="h-screen bg-white">
      {currentScreen === 'home' && (
        <HomeScreen onTransactionsPress={navigateToTransactions} />
      )}

      {currentScreen === 'transactions' && (
        <TransactionHistoryScreen
          onBack={navigateToHome}
          onTransactionPress={handleTransactionPress}
        />
      )}

      {currentScreen === 'transactionDetails' && selectedTransaction && (
        <TransactionDetailsScreen
          transaction={selectedTransaction}
          onBack={() => setCurrentScreen('transactions')}
        />
      )}
    </div>
  );
};

export default App;