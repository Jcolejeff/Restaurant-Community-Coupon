const {
  expect
} = require("chai");
const {
  ethers
} = require("hardhat");

describe("RestaurantNFT", function () {
  this.timeout(50000);

  let restaurantNft;
  let owner;
  let acc1;

  this.beforeEach(async function () {
    // This is executed before each test
    // Deploying the smart contract
    const RestaurantNFT = await ethers.getContractFactory("RestaurantNFT");
    [owner, acc1] = await ethers.getSigners();

    restaurantNft = await RestaurantNFT.deploy();
  });

  it("Should set the right owner", async function () {
    expect(await restaurantNft.owner()).to.equal(owner.address);
  });

  it("Should mint one coupon", async function () {

    // expect(await watchNFT.balanceOf(acc1.address)).to.equal(0);

    const tokenURI = "https://example.com/1";
    const price = ethers.utils.parseUnits("1", "ether");
    await restaurantNft.connect(owner).safeMint(tokenURI, "name", "description", price);
    await restaurantNft;

    // expect(await watchNFT.balanceOf(acc1.address)).to.equal(1);
  });

  it("Should set the correct tokenURI", async function () {
    const tokenURI_1 = "https://example.com/1";
    const tokenURI_2 = "https://example.com/2";

    const price = ethers.utils.parseUnits("1", "ether");

    const tx1 = await restaurantNft.connect(owner).safeMint(tokenURI_1, "name", "description", price);

    await tx1.wait();
    const tx2 = await restaurantNft.connect(owner).safeMint(tokenURI_2, "name", "description", price);

    await tx2.wait();

    expect(await restaurantNft.tokenURI(0)).to.equal(tokenURI_1);
    expect(await restaurantNft.tokenURI(1)).to.equal(tokenURI_2);
  });
  it("Should buy and sell the coupon", async function () {
    const price = ethers.utils.parseUnits("1", "ether");

    await restaurantNft.connect(owner).safeMint("https://example.com/1", "name", "description", price);
    await restaurantNft
      .connect(acc1)
      .buyCoupon(0, {
        value: price
      });
    await restaurantNft.connect(acc1).sellCoupon(0)
  })

  it("Should get the coupon", async function () {
    const price = ethers.utils.parseUnits("1", "ether");

    await restaurantNft.connect(owner).safeMint("https://example.com/1", "name", "description", price);

    await restaurantNft
      .connect(acc1)
      .getCoupons(0);
  })
});