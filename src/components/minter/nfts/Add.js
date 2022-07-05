/* eslint-disable react/jsx-filename-extension */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";
import { uploadToIpfs } from "../../../utils/minter";

// basic attributes that can be added to NFT
const DURATION = ["For Life", "1 Year", "2 Years"];
const DISCOUNT = ["FREE", "50% off", "10% off"];
const FOOD_ITEM = ["All","Pizza", "Ice Cream", "Fried Rice"]

const AddCoupon = ({ save, address }) => {
  const [name, setName] = useState("");
  const [ipfsImage, setIpfsImage] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("")

  //store attributes of an NFT
  const [attributes, setAttributes] = useState([]);
  const [show, setShow] = useState(false);


  // check if all form data has been filled
  const isFormFilled = () => {
    return name && ipfsImage && description && attributes.length > 2;
  }


  // close the popup modal
  const handleClose = () => {
    setShow(false);
    setAttributes([]);
  };

  // display the popup modal
  const handleShow = () => setShow(true);

  // add an attribute to an NFT
  const setAttributesFunc = (e, trait_type) => {
    const { value } = e.target;
    const attributeObject = {
      trait_type,
      value,
    };
    const arr = attributes;

    // check if attribute already exists
    const index = arr.findIndex((el) => el.trait_type === trait_type);

    if (index >= 0) {

      // update the existing attribute
      arr[index] = {
        trait_type,
        value,
      };
      setAttributes(arr);
      return;
    }

    // add a new attribute
    setAttributes((oldArray) => [...oldArray, attributeObject]);
  };

  return (
    <>
      <Button
        onClick={handleShow}
        variant="dark"
        className="rounded-pill px-0"
        style={{ width: "38px" }}
      >
        <i className="bi bi-plus"></i>
      </Button>

      {/* Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Coupon</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <FloatingLabel
              controlId="inputLocation"
              label="Name of Restaurant"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Name of Restaurant"
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </FloatingLabel>

            <FloatingLabel
              controlId="inputDescription"
              label="Description of Coupon"
              className="mb-3"
            >
              <Form.Control
                as="textarea"
                placeholder="Description of Coupon"
                style={{ height: "80px" }}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputLocation"
              label="Price of Coupon"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Price of Coupon"
                onChange={(e) => {
                  setPrice(e.target.value);
                }}
              />
            </FloatingLabel>

            <Form.Control
              type="file"
              className={"mb-3"}
              onChange={async (e) => {
                const imageUrl = await uploadToIpfs(e);
                if (!imageUrl) {
                  alert("failed to upload image");
                  return;
                }
                setIpfsImage(imageUrl);
              }}
              placeholder="Coupon name"
            ></Form.Control>
            <Form.Label>
              <h5>Properties of Coupon</h5>
            </Form.Label>
            <Form.Control
              as="select"
              className={"mb-3"}
              onChange={async (e) => {
                setAttributesFunc(e, "duration");
              }}
              placeholder="Duration"
            >
              <option hidden>Duration</option>
              {DURATION.map((duration) => (
                <option
                  key={`duration-${duration.toLowerCase()}`}
                  value={duration.toLowerCase()}
                >
                  {duration}
                </option>
              ))}
            </Form.Control>

            <Form.Control
              as="select"
              className={"mb-3"}
              onChange={async (e) => {
                setAttributesFunc(e, "discount");
              }}
              placeholder="Discount"
            >
              <option hidden>Discount</option>
              {DISCOUNT.map((discount) => (
                <option
                  key={`discount-${discount.toLowerCase()}`}
                  value={discount.toLowerCase()}
                >
                  {discount}
                </option>
              ))}
            </Form.Control>
            <Form.Control
              as="select"
              className={"mb-3"}
              onChange={async (e) => {
                setAttributesFunc(e, "item");
              }}
              placeholder="Food Item"
            >
              <option hidden>Food Item</option>
              {FOOD_ITEM.map((item) => (
                <option
                  key={`item-${item.toLowerCase()}`}
                  value={item.toLowerCase()}
                >
                  {item}
                </option>
              ))}
            </Form.Control>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="dark"
            disabled={!isFormFilled()}
            onClick={() => {
              save({
                name,
                price,
                ipfsImage,
                description,
                ownerAddress: address,
                attributes,
              });
              handleClose();
            }}
          >
            Create Coupon
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

AddCoupon.propTypes = {

  // props passed into this component
  save: PropTypes.func.isRequired,
  address: PropTypes.string.isRequired,
};

export default AddCoupon;
