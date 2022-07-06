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
    Counters.Counter private _restaurantCounter;

    constructor() ERC721("MR BIGGS", "BIGGS") {}

    uint256 owners = 0;
    // fee to create a restaurant
    uint256 fee = 1 ether;

    struct Coupon {
        uint256 restaurantId;
        string name;
        string description;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    struct Restaurant {
        string name;
        string description;
        address owner;
        uint256 availableCoupons;
        uint256 soldCoupons;
        uint256 totalCoupons;
        uint256 admins;
    }

    mapping(uint256 => Restaurant) public restaurants;

    mapping(uint256 => bool) private restaurantExists;
    mapping(uint256 => mapping(address => bool)) public restaurantAdmins;

    mapping(uint256 => Coupon) public coupons;

    modifier checkInputs(string memory _name, string memory _description) {
        require(bytes(_name).length > 0, "Invalid name");
        require(bytes(_description).length > 0, "Invalid description");

        _;
    }

    modifier validateRestaurantOwner(uint256 restaurantId, address admin) {
        require(
            restaurants[restaurantId].owner == msg.sender,
            "Unauthorized user"
        );
        require(admin != address(0), "Invalid address");
        _;
    }
    modifier verifyPrice(uint256 price) {
        require(price > 0, "Invalid price");
        _;
    }

    modifier exist(uint256 tokenId) {
        require(_exists(tokenId), "query of non existent token");
        _;
    }

    modifier existRestaurant(uint256 restaurantId) {
        require(
            restaurantExists[restaurantId],
            "Query of non existent restaurant"
        );
        _;
    }

    modifier ownedAndSold(uint256 tokenId) {
        require(
            coupons[tokenId].owner == msg.sender,
            "Only item owner can perform this operation"
        );
        require(
            coupons[tokenId].sold &&
                coupons[tokenId].seller == address(0) &&
                coupons[tokenId].price == 0,
            "coupon is already sale"
        );
        _;
    }

    function createRestaurant(string memory _name, string memory _description)
        public
        payable
        checkInputs(_name, _description)
    {
        require(msg.value == fee, "Payment of fee is required");
        uint256 id = _restaurantCounter.current();
        _restaurantCounter.increment();
        restaurants[id] = Restaurant(
            _name,
            _description,
            msg.sender,
            0,
            0,
            0,
            0
        );
        owners++;
        restaurantAdmins[id][msg.sender] = true;
        restaurantExists[id] = true;
    }

    // add admin to restaurant
    // remove admin from restaurant
    function addRestaurantAdmin(uint256 restaurantId, address admin)
        public
        validateRestaurantOwner(restaurantId, admin)
    {
        require(!restaurantAdmins[restaurantId][admin], "already an admin");
        restaurantAdmins[restaurantId][admin] = true;
        restaurants[restaurantId].admins++;
    }

    // remove admin of a restaurant
    // callable only by the restaurant owner
    function removeRestaurantAdmin(uint256 restaurantId, address admin)
        public
        validateRestaurantOwner(restaurantId, admin)
    {
        require(
            restaurantAdmins[restaurantId][admin],
            "address isn't an admin"
        );
        restaurantAdmins[restaurantId][admin] = false;
        restaurants[restaurantId].admins--;
    }

    // allows a restaurant to add a coupon
    // calleable only by a restaurant admin or the restaurant owner
    function safeMint(
        string memory uri,
        string memory _name,
        string memory _description,
        uint256 price,
        uint256 restaurantId
    )
        public
        payable
        existRestaurant(restaurantId)
        checkInputs(_name, _description)
        verifyPrice(price)
        returns (uint256)
    {
        require(bytes(uri).length > 0, "Invalid uri");
        require(
            restaurants[restaurantId].owner == msg.sender ||
                restaurantAdmins[restaurantId][msg.sender],
            "Only restaurants owners or admins can mint a coupon"
        );
        uint256 tokenId = _tokenIdCounter.current();

        _tokenIdCounter.increment();
        addRestaurantCoupon(tokenId, restaurantId, _name, _description, price);
        restaurants[restaurantId].totalCoupons++;
        restaurants[restaurantId].availableCoupons++;

        _mint(msg.sender, tokenId);

        _setTokenURI(tokenId, uri);

        return tokenId;
    }

    function addRestaurantCoupon(
        uint256 tokenId,
        uint256 restaurantId,
        string memory _name,
        string memory _description,
        uint256 price
    ) private checkInputs(_name, _description) verifyPrice(price) {
        require(!_exists(tokenId), "token already exists");
        coupons[tokenId] = Coupon(
            restaurantId,
            _name,
            _description,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );
        _transfer(msg.sender, address(this), tokenId);
    }

    // allows users to buy a coupon from a restaurant
    function buyCoupon(uint256 tokenId) public payable exist(tokenId) {
        uint256 price = coupons[tokenId].price;
        address seller = coupons[tokenId].seller;
        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );
        require(
            seller != msg.sender,
            "coupon owners can't buy their own tokens"
        );
        require(!coupons[tokenId].sold, "coupon isn't available");
        coupons[tokenId].owner = payable(msg.sender);
        coupons[tokenId].sold = true;
        coupons[tokenId].seller = payable(address(0));
        coupons[tokenId].price = 0;
        restaurants[coupons[tokenId].restaurantId].soldCoupons++;
        restaurants[coupons[tokenId].restaurantId].availableCoupons++;
        _transfer(address(this), msg.sender, tokenId);
        (bool success, ) = payable(seller).call{value: price}("");
        require(success, "payment failed");
    }

    // allows user to sell a coupon from a restaurant
    function sellCoupon(uint256 tokenId, uint256 price)
        public
        payable
        exist(tokenId)
        ownedAndSold(tokenId)
        verifyPrice(price)
    {
        Coupon storage currentCoupon = coupons[tokenId];
        currentCoupon.sold = false;
        currentCoupon.seller = payable(msg.sender);
        currentCoupon.owner = payable(address(this));
        currentCoupon.price = price;
        restaurants[currentCoupon.restaurantId].soldCoupons--;
        restaurants[currentCoupon.restaurantId].availableCoupons++;
        _transfer(msg.sender, address(this), tokenId);
    }

    // allows user to claim and burn a coupon
    function claimCoupon(uint256 tokenId)
        public
        exist(tokenId)
        ownedAndSold(tokenId)
    {
        delete coupons[tokenId];
        _burn(tokenId);
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
