// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BdagToken is ERC20, Ownable {
    constructor() ERC20("Bdag Token", "BDAGT") Ownable(msg.sender) {
        _mint(msg.sender, 1000000000 ether); // Mint 10,000 tokens with 18 decimals
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}