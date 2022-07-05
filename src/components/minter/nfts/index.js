import { useContractKit } from "@celo-tools/use-contractkit";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import AddCoupon from "./Add";
import Nft from "./Card";
import Loader from "../../ui/Loader";
import { NotificationSuccess, NotificationError } from "../../ui/Notifications";
import {
  getCoupons,
  buyCoupons,
  sellCoupons,
  createCoupon,
  fetchNftContractOwner,
} from "../../../utils/minter";
import { Row } from "react-bootstrap";

const NftList = ({ minterContract, name }) => {
  /* performActions : used to run smart contract interactions in order
   *  address : fetch the address of the connected wallet
   */
  const { performActions, address, kit } = useContractKit();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nftOwner, setNftOwner] = useState(null);
  const { defaultAccount } = kit;
  const getCouponNFT = useCallback(async () => {
    try {
      setLoading(true);

      // fetch all nfts from the smart contract
      const _nfts = await getCoupons(minterContract);
      if (!_nfts) return;
      setNfts(_nfts);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }, [minterContract]);

  const addCoupon = async (data) => {
    try {
      setLoading(true);

      // create an nft functionality
      await createCoupon(minterContract, performActions, data);
      toast(<NotificationSuccess text="Updating Coupon list...." />);
      getCouponNFT();
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to create a Coupon." />);
    } finally {
      setLoading(false);
    }
  };

  const buyCoupon = async (index, tokenId) => {
    try {
      setLoading(true);
      await buyCoupons(minterContract, index, tokenId, performActions);
      getCouponNFT();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const sellCoupon = async (index) => {
    try {
      setLoading(true);
      await sellCoupons(minterContract, index, performActions);
      getCouponNFT();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContractOwner = useCallback(async (minterContract) => {
    // get the address that deployed the NFT contract
    const _address = await fetchNftContractOwner(minterContract);
    setNftOwner(_address);
  }, []);

  useEffect(() => {
    try {
      if (address && minterContract) {
        console.log(address);
        getCouponNFT();
        fetchContractOwner(minterContract);
      }
    } catch (error) {
      console.log({ error });
    }
  }, [minterContract, address, getCouponNFT, fetchContractOwner]);
  if (address) {
    return (
      <>
        {!loading ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="fs-4 fw-bold mb-0">{name}</h1>

              <AddCoupon save={addCoupon} address={address} />
            </div>
            <Row xs={1} sm={2} lg={3} className="g-3 mb-5 g-xl-4 g-xxl-5">
              {/* display all NFTs */}
              {nfts.map((_nft) => (
                <Nft
                  key={_nft.index}
                  contractOwner={defaultAccount}
                  buyCoupon={() => buyCoupon(_nft.index, _nft.tokenId)}
                  sellCoupon={() => sellCoupon(_nft.tokenId)}
                  nft={{
                    ..._nft,
                  }}
                />
              ))}
            </Row>
          </>
        ) : (
          <Loader />
        )}
      </>
    );
  }
  return null;
};

NftList.propTypes = {
  // props passed into this component
  minterContract: PropTypes.instanceOf(Object),
  updateBalance: PropTypes.func.isRequired,
};

NftList.defaultProps = {
  minterContract: null,
};

export default NftList;
