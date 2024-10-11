import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const App = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [inputValue, setInputValue] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [recipient, setRecipient] = useState(''); 
  const [accountBalance, setAccountBalance] = useState();

  // Contract details
  const contractAddress = '0xA15BB66138824a1c7167f5E85b957d04Dd34E468'; // Update with your contract address
  const contractABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Deposit",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Withdraw",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "deposit",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTransactions",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "receiver",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct DecentralizedBank.Transaction[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "transactions",
      "outputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Get the signer from the provider
        const signer = await provider.getSigner();

        // Set provider and account
        setProvider(provider);
        const userAccount = await signer.getAddress();
        setAccount(userAccount);

        // Initialize contract
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contract);
      } else {
        console.log('MetaMask is not installed');
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  };

  // Get balance
  const getBalance = async () => {
    try {
      if (contract && account) {
        const balance = await provider.getBalance(account);
        setBalance(ethers.formatEther(balance));
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  // get account balance
  const getAccountBalance = async () => {
    try {
      if (contract && account) {
        const balance = await contract.getBalance();
        setAccountBalance(ethers.formatEther(balance));
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      if (contract) {
        const transactions = await contract.getTransactions();
        setTransactions(transactions);
        console.log(transactions)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Deposit function
  const deposit = async () => {
    try {
      if (contract && account && inputValue > 0) {
        const tx = await contract.deposit({
          value: ethers.parseEther(inputValue), // Convert input value to ethers
        });

        await tx.wait(); // Wait for transaction confirmation
        await getBalance(); // Update balance after deposit
        await fetchTransactions(); // Fetch transactions after deposit
        setInputValue(''); // Clear input after deposit
        await getAccountBalance();
      } else {
        console.error('Invalid input or contract not initialized');
      }
    } catch (error) {
      console.error('Error depositing balance:', error);
    }
  };

  // Withdraw function
  const withdraw = async () => {
    try {
      if (contract && account && inputValue > 0) {
        const tx = await contract.withdraw(ethers.parseEther(inputValue));
        await tx.wait(); // Wait for transaction confirmation
        await getBalance(); // Update balance after withdrawal
        await fetchTransactions(); // Fetch transactions after withdrawal
        setInputValue(''); // Clear input after withdrawal
        await getAccountBalance();
      } else {
        console.error('Invalid input or contract not initialized');
      }
    } catch (error) {
      console.error('Error withdrawing balance:', error);
    }
  };

  // Transfer function
  const transfer = async () => {
    try {
      if (contract && account && inputValue > 0 && recipient) {
        const tx = await contract.transfer(recipient, ethers.parseEther(inputValue));
        await tx.wait(); // Wait for transaction confirmation
        await getBalance(); // Update balance after transfer
        await fetchTransactions(); // Fetch transactions after transfer
        setInputValue(''); // Clear input after transfer
        setRecipient(''); // Clear recipient after transfer
        await getAccountBalance();
      } else {
        console.error('Invalid input or contract not initialized');
      }
    } catch (error) {
      console.error('Error transferring balance:', error);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Fetch balance and transactions on component mount and when account changes
  useEffect(() => {
    if (account) {
      getBalance();
      fetchTransactions();
      getAccountBalance();
    }
  },[account]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Decentralized Banking System</h1>
      {!account ? (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      ) : (
        <div className="bg-white p-8 rounded shadow-md w-[50%]">
          <p className="text-xl mb-4">Account: {account}</p>
          <p className="text-xl mb-4">Hard Cash Balance: {balance} ETH</p>
          <p className="text-xl mb-4">Account Balance: {accountBalance} ETH</p>

          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter amount"
            className="border p-2 w-full mb-4"
          />
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full mb-4"
            onClick={deposit}
          >
            Deposit
          </button>

          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full mb-4"
            onClick={withdraw}
          >
            Withdraw
          </button>

          <input
            type="text"
            placeholder="Recipient Address"
            className="border p-2 w-full mb-4"
            onChange={(e) => setRecipient(e.target.value)} // Update recipient state
          />

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mb-4"
            onClick={transfer} // Call transfer with recipient
          >
            Transfer
          </button>

          <h2 className="text-xl mt-4">Transaction History:</h2>
          <ul className="mt-2">
            {transactions.length > 0 ? (
              transactions.map((tx, index) => (
                <li key={index}>
                  {String(tx.sender)} sent {String(tx.amount)} ETH to {String(tx.receiver)} at {new Date(Number(tx.timestamp) * 1000).toLocaleString()} <br/> <br/>
                </li>
              ))
            ) : (
              <li>No transactions available</li>
            )}

          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
