// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GrokKarmaToken {
    string public name = "Grok Karma Token";
    string public symbol = "GKT";
    uint256 public totalSupply = 1_000_000_000 * 10**18;
    address public xAIAdmin;
    uint256 public constant TAX_RATE = 2;

    mapping(address => uint256) public balanceOf;
    mapping(address => uint256) public stakedBalance;

    event Mint(address indexed to, uint256 value, string reason);
    event Burn(address indexed from, uint256 value, string cause);
    event Stake(address indexed user, uint256 amount);

    constructor() {
        xAIAdmin = msg.sender;
        balanceOf[xAIAdmin] = totalSupply;
    }

    function mintForContribution(address user, uint256 amount, string memory reason) public {
        require(msg.sender == xAIAdmin, "Only xAI can mint");
        balanceOf[user] += amount;
        emit Mint(user, amount, reason);
    }

    function burnForCause(uint256 amount, string memory cause) public {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Burn(msg.sender, amount, cause);
    }

    function stake(uint256 amount) public {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        stakedBalance[msg.sender] += amount;
        emit Stake(msg.sender, amount);
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        uint256 tax = (amount * TAX_RATE) / 100;
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += (amount - tax);
        balanceOf[xAIAdmin] += tax / 2;
        totalSupply -= tax / 2;
        return true;
    }

    function scoreContribution(string memory idea) external view returns (uint256) {
        return bytes(idea).length > 50 ? 50 * 10**18 : 10 * 10**18;
    }
}
