import React, { useState } from "react";
import PropTypes from "prop-types";
import { Card, Col, Badge, Stack, Row } from "react-bootstrap";
import { truncateAddress } from "../../../utils";
import { Form, Button } from "react-bootstrap";
import Identicon from "../../ui/Identicon";

const CouponCard = ({ nft, send, contractOwner, buyCoupon, sellCoupon }) => {
  const { image, description, owner, name, index, price, attributes, sold } =
    nft;
  const handleSend = (index, owner) => {
    if (!sendAddress) return;
    send(sendAddress, index, owner);
  };
  const [sendAddress, setSendAddress] = useState("");
  return (
    <Col key={index}>
      <Card className=" h-100">
        <Card.Header>
          <Stack direction="horizontal" gap={2}>
            <Identicon address={owner} size={28} />
            <span className="font-monospace text-secondary">
              {truncateAddress(owner)}
            </span>
            <Badge bg="secondary" className="ms-auto">
              {price / 10 ** 18} CELO
            </Badge>
          </Stack>
        </Card.Header>

        <div className=" ratio ratio-4x3">
          <img src={image} alt={description} style={{ objectFit: "cover" }} />
        </div>

        <Card.Body style={{"color": "#000"}} className="d-flex  flex-column text-center">
          <Card.Title>{name}</Card.Title>
          <Card.Text className="flex-grow-1">{description}</Card.Text>
          <div>
            <Row className="mt-2">
              {attributes.map((attribute, key) => (
                <Col key={key}>
                  <div className="border rounded bg-light">
                    <div className="text-secondary fw-lighter small text-capitalize">
                      {attribute.trait_type}
                    </div>
                    <div className="text-secondary text-capitalize font-monospace">
                      {attribute.value}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
          {!sold ? (
            <Button variant="outline-primary mt-2" onClick={buyCoupon}>
              Claim Coupon
            </Button>
          ) : contractOwner === owner ? (
            <Button variant="outline-danger mt-2" onClick={sellCoupon}>
              Sell Coupon
            </Button>
          ) : (
            <Button variant="outline-danger mt-2" disabled>
            This Coupon is owned
            </Button>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

CouponCard.propTypes = {
  // props passed into this component
  nft: PropTypes.instanceOf(Object).isRequired,
};

export default CouponCard;
