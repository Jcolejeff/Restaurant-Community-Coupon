import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";
import { ethers } from "ethers";

// initialize IPFS
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

// mint an NFT
export const createCoupon = async (
  minterContract,
  performActions,
  { name, price, description, ipfsImage, ownerAddress, attributes }
) => {
  await performActions(async (kit) => {
    if (!name || !description || !ipfsImage) return;
    const { defaultAccount } = kit;

    // convert NFT metadata to JSON format
    const data = JSON.stringify({
      name,
      price,
      description,
      image: ipfsImage,
      owner: defaultAccount,
      attributes,
    });

    try {
      // save NFT metadata to IPFS
      const added = await client.add(data);

      // IPFS url for uploaded metadata
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      const _price = ethers.utils.parseUnits(String(price), "ether");

      // mint the NFT and save the IPFS url to the blockchain
      let transaction = await minterContract.methods
        .safeMint(url, name, description, _price)
        .send({ from: defaultAccount });

      return transaction;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  });
};

// function to upload a file to IPFS
export const uploadToIpfs = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const added = await client.add(file, {
      progress: (prog) => console.log(`received: ${prog}`),
    });
    return `https://ipfs.infura.io/ipfs/${added.path}`;
  } catch (error) {
    console.log("Error uploading file: ", error);
  }
};

// fetch all NFTs on the smart contract
export const getCoupons = async (minterContract) => {
  try {
    const coupons = [];
    const couponLength = await minterContract.methods.getCouponsLength().call();
    console.log(couponLength);
    for (let i = 0; i < couponLength; i++) {
      const nft = new Promise(async (resolve) => {
        const coupon = await minterContract.methods.getCoupons(i).call();
        const res = await minterContract.methods.tokenURI(i).call();
        const meta = await fetchNftMeta(res);
        const owner = await fetchNftOwner(minterContract, i);
        resolve({
          index: i,
          tokenId: i,
          owner,
          price: coupon.price,
          sold: coupon.sold,
          name: meta.data.name,
          image: meta.data.image,
          description: meta.data.description,
          attributes: meta.data.attributes,
        });
      });
      coupons.push(nft);
      console.log(coupons);
    }
    return Promise.all(coupons);
  } catch (e) {
    console.log({ e });
  }
};

// get the metadata for an NFT from IPFS
export const fetchNftMeta = async (ipfsUrl) => {
  try {
    if (!ipfsUrl) return null;
    const meta = await axios.get(ipfsUrl);
    return meta;
  } catch (e) {
    console.log({ e });
  }
};

// get the owner address of an NFT
export const fetchNftOwner = async (minterContract, index) => {
  try {
    return await minterContract.methods.ownerOf(index).call();
  } catch (e) {
    console.log({ e });
  }
};

// get the address that deployed the NFT contract
export const fetchNftContractOwner = async (minterContract) => {
  try {
    let owner = await minterContract.methods.owner().call();
    return owner;
  } catch (e) {
    console.log({ e });
  }
};

export const buyCoupons = async (
  minterContract,
  index,
  tokenId,
  performActions
) => {
  try {
    await performActions(async (kit) => {
      const { defaultAccount } = kit;
      const coupon = await minterContract.methods.getCoupons(index).call();
      await minterContract.methods
        .buyCoupon(tokenId)
        .send({ from: defaultAccount, value: coupon.price });
    });
  } catch (error) {
    console.log({ error });
  }
};

export const sellCoupons = async (minterContract, tokenId, performActions) => {
  try {
    await performActions(async (kit) => {
      const { defaultAccount } = kit;
      await minterContract.methods
        .sellCoupon(tokenId)
        .send({ from: defaultAccount });
    });
  } catch (error) {
    console.log({ error });
  }
};

export const getOwners = async (minterContract) => {
  try {
    const ownerCount = await minterContract.methods.getOwners().call();
    return ownerCount;
  } catch (error) {
    console.log({ error });
  }
};
