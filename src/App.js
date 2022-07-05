import React from "react";
import Cover from "./components/Cover";
import { Notification } from "./components/ui/Notifications";
import Wallet from "./components/wallet";
import { useBalance, useMinterContract } from "./hooks";

import Nfts from "./components/minter/nfts";
import { useContractKit } from "@celo-tools/use-contractkit";

import "./App.css";

import { Container, Nav } from "react-bootstrap";

const App = function AppWrapper() {
  /*
    address : fetch the connected wallet address
    destroy: terminate connection to user wallet
    connect : connect to the celo blockchain
     */
  const { address, destroy, connect } = useContractKit();

  //  fetch user's celo balance using hook
  const { balance, getBalance } = useBalance();

  // initialize the NFT mint contract
  const minterContract = useMinterContract();

  return (
    <body>
      <Notification />

      {address ? (
        <div>
          <Nav className="justify-content-between pt-3 pb-5">
          <h2>RCC-Building The Food Future</h2>
            <Nav.Item>
              {/*display user wallet*/}
              <Wallet
                address={address}
                amount={balance.CELO}
                symbol="CELO"
                destroy={destroy}
              />
            </Nav.Item>
          </Nav>
          <main className="p-2">
            <Nfts
              name="Restaurant Community Coupons"
              updateBalance={getBalance}
              minterContract={minterContract}
            />
          </main>
        </div>
      ) : (
        //  if user wallet is not connected display cover page
        <Cover
          name="Restaurant Community Coupons"
          coverImg={
            "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=435&q=80"
          }
          connect={connect}
        />
      )}
    </body>
  );
};

export default App;
