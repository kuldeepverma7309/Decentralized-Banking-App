// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DecentralizedBank {
    // Define a transaction structure
    struct Transaction {
        address sender;
        address receiver;
        uint amount;
        uint timestamp;
    }


    mapping(address => uint) private balances;  // Store balances
    Transaction[] public transactions;         // Store all transactions

    // Deposit event
    event Deposit(address indexed account, uint amount);

    // Withdraw event
    event Withdraw(address indexed account, uint amount);

    // Transfer event
    event Transfer(address indexed from, address indexed to, uint amount);

    // Get balance of the caller
    function getBalance() public view returns (uint) {
        return balances[msg.sender];
    }

    // Deposit funds into the bank
    function deposit() public payable {
        require(msg.value > 0, "Deposit must be greater than 0");
        balances[msg.sender] += msg.value;
        transactions.push(Transaction(msg.sender, address(this), msg.value, block.timestamp));

        // Emit the deposit event
        emit Deposit(msg.sender, msg.value);
    }

    // Withdraw funds from the bank
    function withdraw(uint _amount) public {
        require(_amount <= balances[msg.sender], "Insufficient balance");
        balances[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
        transactions.push(Transaction(address(this), msg.sender, _amount, block.timestamp));
        // Emit the withdraw event
        emit Withdraw(msg.sender, _amount);
    }

    // Transfer funds from sender to another address
    function transfer(address _to, uint _amount) public {
        require(_amount <= balances[msg.sender], "Insufficient balance");
        require(_to != address(0), "Invalid recipient address");

        balances[msg.sender] -= _amount;
        balances[_to] += _amount;

        // Record the transaction
        transactions.push(Transaction(msg.sender, _to, _amount, block.timestamp));

        // Emit the transfer event
        emit Transfer(msg.sender, _to, _amount);
    }

    // Get all transaction history
    function getTransactions() public view returns (Transaction[] memory) {
        return transactions;
    }
}
