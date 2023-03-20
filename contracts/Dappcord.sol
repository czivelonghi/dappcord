// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Dappcord is ERC721 {
    uint256 public totalSupply = 0;
    uint256 public totalChannels = 0;
    address public owner;

    struct Channel {
        uint256 id;
        string name;
        uint256 cost;
    }

    mapping(uint256 => Channel) public channels;
    mapping(uint256 => mapping(address => bool)) public hasJoined; //people that have joined channels

    modifier onlyOwner(){
        require(msg.sender == owner); //only contract owner can create channels
        _;
    }

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        owner = msg.sender;
    }

    // channel
    function  createChannel(string memory _name, uint256 _cost)  public onlyOwner {
        totalChannels ++;
        channels[totalChannels] = Channel(totalChannels, _name, _cost);
    }

    //join channel by minting an nft
    function mint(uint256 _id) public payable {
        require(_id != 0);
        require(_id <= totalChannels);
        require(hasJoined[_id][msg.sender] == false);
        require(msg.value >= channels[_id].cost);

        // join channel
        hasJoined[_id][msg.sender] = true;
        // mint
        totalSupply ++;
        _safeMint(msg.sender, totalSupply); //open zepplin 721 contract (ERC721.sol)
    }

    function getChannel(uint256 _id) public view returns(Channel memory) {
        return channels[_id];
    }

    // only owner can withdraw funds
    function withdraw() public onlyOwner{
        // address(this) = current contract
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }
}
