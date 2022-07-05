// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RestaurantNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("MR BIGGS", "BIGGS") {}

    uint256 owners = 0;

    struct Restaurant {
        uint256 tokenId;
        string name;
        string description;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => Restaurant) private restaurants;

    function safeMint(string memory uri, string memory _name, string memory _description, uint256 price)
        public
        payable
        returns (uint256)
    {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(msg.sender, tokenId);

        _setTokenURI(tokenId, uri);
        addRestaurantCoupon(tokenId, _name, _description, price);
        return tokenId;
    }


    function addRestaurantCoupon(uint256 tokenId, string memory _name, string memory _description, uint256 price) private {
        require(price > 0, "Price must be at least 1 wei");
        restaurants[tokenId] = Restaurant(
            tokenId,
            _name,
            _description,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId);
    }

    function buyCoupon(uint256 tokenId) public payable {
        uint256 price = restaurants[tokenId].price;
        address seller = restaurants[tokenId].seller;
        require(
            msg.value >= price,
            "Please submit the asking price in order to complete the purchase"
        );
        restaurants[tokenId].owner = payable(msg.sender);
        restaurants[tokenId].sold = true;
        restaurants[tokenId].seller = payable(address(0));
        _transfer(address(this), msg.sender, tokenId);

        payable(seller).transfer(msg.value);
    }

    function sellCoupon(uint256 tokenId) public payable {
        require(
            restaurants[tokenId].owner == msg.sender,
            "Only item owner can perform this operation"
        );
        restaurants[tokenId].sold = false;
        restaurants[tokenId].seller = payable(msg.sender);
        restaurants[tokenId].owner = payable(address(this));

        _transfer(msg.sender, address(this), tokenId);
    }

    function getCoupons(uint256 tokenId) public view returns (Restaurant memory) {
        return restaurants[tokenId];
    }

    function getCouponsLength() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function getOwners() public view returns (uint256) {
        return owners;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
