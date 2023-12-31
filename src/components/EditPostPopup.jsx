import React, { useEffect, useState } from "react";
import FilterSelect from "./FilterSelect";
import { useLocalStorage } from "react-use";
import { useUserPost, useUserPostDispatch } from "../contexts/UserPostContext";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import { fabClasses } from "@mui/material";
import AsyncSelect from "react-select/async";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useForm, Controller } from "react-hook-form";

const api = process.env.REACT_APP_DATABASE_URL;

function EditPostPopup({ trigger, close, post, update, mode }) {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const colorOptions = ["Yellow", "Black", "White", "Brown", "Grey", "Multi", "Cream", "Other"];

  const speciesOptions = ["Dog", "Cat", "Bird", "Rabbit", "Other"];

  // The breed options are defined as an array of objects with species as keys.
  const breedOptions = [
    {
      Dog: ["Dachshund", "Poodle", "Labrador", "Pug", "Samoyed", "Other"]
    },
    {
      Cat: ["Persian", "Siamese", "Bengal", "Ragdoll", "American Bobtail", "Other"]
    },
    {
      Bird: ["Cockatiel", "Budgerigar", "Lovebird", "Parrot", "Other"]
    },
    {
      Rabbit: ["Dutch", "Lionhead", "Mini Lop", "Netherland Dwarf", "Other"]
    },
    {
      Other: ["Other"]
    }
  ];

  const [selectedColor, setSelectedColor] = useState(post.color || "");
  const [suburb, setSuburb] = useState(post.suburb || "");
  const [title, setTitle] = useState(post.title || "");
  const [description, setDescription] = useState(post.description || "");
  const [userAuth, setUserAuth] = useLocalStorage("pawsReuniteUserAuth");
  const userPostDispatch = useUserPostDispatch();
  const [contactInfo, setContactInfo] = useState(post.contactInfo || "");
  const [selectedStatus, setSelectedStatus] = useState(post.status || "lost");
  const [selectedSpecies, setSelectedSpecies] = useState(post.species || "");
  const [selectedBreed, setSelectedBreed] = useState(post.breed || "");
  const [selectedImages, setSelectedImages] = useState(post.photos || []);
  const [updatedImages, setUpdatedImages] = useState([]);
  const [titleError, setTitleError] = useState("");
  const [contactInfoError, setContactInfoError] = useState("");

  // make an api call to get the suburb options based on the postcode or suburb name entered
  const handleSuburbChange = async (suburb) => {
    let response = await fetch(`${api}/suburbs/search?postcode=${suburb}`);
    let jsonData = await response.json();
    return jsonData;
  };

  const handleColorChange = (event) => {
    const colorValue = event.target.value;
    setSelectedColor(colorValue);
  };

  const handleDescriptionChange = (event) => {
    const descriptionValue = event.target.value;
    setDescription(descriptionValue);
  };

  const handleStatusChange = (event) => {
    const statusValue = event.target.value;
    setSelectedStatus(statusValue);
  };

  const handleSpeciesChange = (event) => {
    const speciesValue = event.target.value;
    setSelectedSpecies(speciesValue);
    // It also resets the selected breed.
    setSelectedBreed("");
  };

  // Retrieve breed options based on selected species
  const breedOptionsForSelectedSpecies = breedOptions.find((option) =>
    option.hasOwnProperty(selectedSpecies)
  );

  // If breed options are available for the selected species, retrieve them.
  const breedOptionsList =
    breedOptionsForSelectedSpecies && breedOptionsForSelectedSpecies[selectedSpecies];

  const handleBreedChange = (event) => {
    const breedValue = event.target.value;
    setSelectedBreed(breedValue);
  };

  // for phone number validation using libphonenumber-js
  const validatePhoneNumber = (contactInfoValue) => {
    const phoneNumber = parsePhoneNumberFromString(contactInfoValue, "AU");
    if (phoneNumber && phoneNumber.isValid()) {
      return true;
    } else {
      return "Phone number is invalid";
    }
  };

  // for image upload
  const fileSelectedHandler = (event) => {
    const selectedFiles = event.target.files;
    const selectedFilesArray = Array.from(selectedFiles);

    setUpdatedImages((prevImages) => [
      ...prevImages,
      ...selectedFilesArray.map((file) => ({
        url: URL.createObjectURL(file),
        file: file
      }))
    ]);
  };

  // for image delete
  const handleDeleteImage = (url) => {
    setUpdatedImages((prevImages) => prevImages.filter((image) => image.url !== url));
  };

  //for update old image delete
  const handleDeleteOldImage = (image) => {
    setSelectedImages((prevImages) => prevImages.filter((item) => item !== image));
  };

  // create notification when post is created and compare with other posts in database to see if there is a match
  // if there is a match, create a notification for the user who created the other post
  const handleComaprePost = async (post) => {
    const response = await fetch(`${api}/posts`, {
      method: "GET"
    });
    const jsonData = await response.json();
    // compare the new post with other posts in database
    const comparePost = jsonData.data.find(
      (item) =>
        item.color === post.color &&
        // only compare the status if the status is different from the new post
        item.status !== post.status &&
        item.species === post.species &&
        item.breed === post.breed
    );
    if (comparePost) {
      const comparePostUserId = comparePost.userId;
      const newNotification = {
        userId: comparePostUserId,
        message: `A new post has been created that matches your ${comparePost.status} pet(${comparePost.title}), please click and check this post or contact number ${post.contactInfo} for more information.`,
        postId: comparePost._id
      };
      const response = await fetch(`${api}/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newNotification)
      });
      const jsonData = await response.json();
    }
  };

  // for create post
  const handleCreatePost = async (data) => {
    // validate those required fields are not empty
    if (!selectedSpecies || !selectedBreed || !selectedColor || !suburb) {
      alert("Please select species, breed, color and suburb.");
      return;
    }
    // validate uploaded images are not empty
    if (updatedImages.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("suburb", suburb);
      formData.append("status", selectedStatus);
      formData.append("description", description);
      formData.append("contactInfo", data.contactInfo);
      formData.append("color", selectedColor);
      formData.append("breed", selectedBreed);
      formData.append("species", selectedSpecies);
      // append uploaded images to formData to send to backend
      updatedImages.forEach((image) => {
        formData.append("photos", image.file);
      });

      const response = await fetch(`${api}/posts`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${userAuth.jwt}`
        },
        body: formData
      });
      const result = await response.json();
      // update the userPost list in context
      userPostDispatch({ type: "create", newPost: result.data });
      alert("Post has been created.");

      // create notification if there is a match
      handleComaprePost(result.data);
      close();
    } catch (error) {
      console.log(error);
    }
  };

  // for update post
  const handleUpdatePost = async (data) => {
    // validate those required fields are not empty
    if (!selectedSpecies || !selectedBreed || !selectedColor || !suburb) {
      alert("Please select species, breed, color and suburb.");
      return;
    }
    // validate uploaded images are not empty
    if (selectedImages.length === 0 && updatedImages.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    try {
      const formData = new FormData();
      // append the updated data to formData
      // if the data is not updated, use the original data
      formData.append("title", data.title || title);
      formData.append("suburb", suburb);
      formData.append("status", selectedStatus);
      formData.append("description", description);
      formData.append("contactInfo", data.contactInfo || contactInfo);
      formData.append("color", selectedColor);
      formData.append("breed", selectedBreed);
      formData.append("species", selectedSpecies);
      formData.append("oldphotos", selectedImages);
      updatedImages.forEach((image) => {
        formData.append("photos", image.file);
      });
      const response = await fetch(`${api}/posts/${post._id}`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${userAuth.jwt}`
        },
        body: formData
      });
      const result = await response.json();
      // update the userPost list in context
      userPostDispatch({ type: "update", newPost: result.data });
      alert("Post has been UPDATED.");
      window.location.reload();

      close();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {trigger && post ? (
        <div
          className="popup fixed left-0 top-0 w-full h-full bg-black bg-opacity-80 flex justify-center items-center"
          style={{ zIndex: "2000" }}
        >
          <div className="popup-inner xs:w-full xs:h-full h-5/6 p-8 max-w-xl bg-white overflow-y-auto">
            <form
              className="flex flex-col gap-8"
              // use handleSubmit from react-hook-form to validate the form
              onSubmit={
                mode === "create" ? handleSubmit(handleCreatePost) : handleSubmit(handleUpdatePost)
              }
            >
              <div className="title-container flex flex-col">
                {/* use Controller from react-hook-form to control the input */}
                <Controller
                  name="title"
                  defaultValue={title}
                  control={control}
                  rules={{
                    required: "Title is required",
                    maxLength: {
                      value: 15,
                      message: "Title cannot be more than 15 characters"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="standard-basic"
                      label="Title"
                      variant="standard"
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />
              </div>

              <div className="filter-container grid grid-cols-2 gap-2">
                {/* use filterSelect component to render the filter */}
                <FilterSelect
                  label="Species"
                  value={selectedSpecies}
                  options={speciesOptions}
                  onChange={handleSpeciesChange}
                  title="species" // Add the title prop for the first filter
                />
                {/* if species is selected and breedOptionsList is not null, render the breed filter */}
                {breedOptionsList && (
                  <FilterSelect
                    label="Breed"
                    value={selectedBreed}
                    options={breedOptionsList}
                    onChange={handleBreedChange}
                    title="breed" // Add the title prop for the first filter
                  />
                )}
                <FilterSelect
                  label="Color"
                  value={selectedColor}
                  options={colorOptions}
                  onChange={handleColorChange}
                />
                {/* render the status filter */}
                <AsyncSelect
                  placeholder="Suburb"
                  defaultValue={suburb ? { value: suburb, label: suburb } : null}
                  loadOptions={(input) => handleSuburbChange(input)}
                  onChange={(input) => setSuburb(input.value)}
                />
              </div>
              <div className="description flex flex-col text-gray-500">
                <label className="text-left mb-2">Description</label>
                <textarea
                  className="border border-gray-300 rounded-md p-2"
                  value={description}
                  placeholder="Please describe your pet"
                  onChange={handleDescriptionChange}
                  rows={6}
                />
              </div>
              {/* render the contactInfo input and validate the input number */}
              <div className="contactInfo-container flex flex-col">
                <Controller
                  name="contactInfo"
                  defaultValue={contactInfo}
                  control={control}
                  rules={{
                    required: "ContactInfo is required",
                    validate: validatePhoneNumber
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="standard-basic"
                      label="ContactInfo"
                      variant="standard"
                      error={!!errors.contactInfo}
                      helperText={errors.contactInfo?.message}
                    />
                  )}
                />
              </div>

              {/* render the status "lost or found" */}
              <div className="status flex flex-col text-gray-500">
                <label className="text-left mb-2">Status</label>
                <div className="radio-buttons grid grid-cols-2 gap-4">
                  <label className="radio-button ">
                    <input
                      type="radio"
                      name="status"
                      value="lost"
                      onChange={handleStatusChange}
                      checked={selectedStatus === "lost"}
                      className="hidden"
                    />
                    <div
                      className={`${
                        selectedStatus === "lost" && "border-blue-500 border-2"
                      }  py-2 px-4 rounded-md border bg-gray-100 cursor-pointer hover:bg-gray-200`}
                    >
                      Lost
                    </div>
                  </label>
                  <label className="radio-button">
                    <input
                      type="radio"
                      name="status"
                      value="found"
                      onChange={handleStatusChange}
                      checked={selectedStatus === "found"}
                      className="hidden"
                    />
                    <div
                      className={`${
                        selectedStatus === "found" && "border-blue-500 border-2"
                      } py-2 px-4 rounded-md border bg-gray-100 cursor-pointer hover:bg-gray-200`}
                    >
                      Found
                    </div>
                  </label>
                </div>
              </div>

              <div className="upload-images flex flex-col text-gray-500">
                <label className="text-left mb-2">Upload Images</label>
                <input
                  type="file"
                  onChange={fileSelectedHandler}
                  multiple
                  accept="image/png, image/jpeg"
                  className="mb-4"
                />

                <div className="images grid grid-cols-3 gap-4 text-orange-900 mb-5">
                  {/* render the images that are selected, this is been used for update the old images */}
                  {selectedImages &&
                    selectedImages.map((image, index) => (
                      <div key={image} className="relative">
                        <img
                          src={image}
                          className="w-28 h-28 aspect-square object-cover"
                          alt="pet"
                        />
                        <CancelRoundedIcon
                          onClick={() => handleDeleteOldImage(image)}
                          className="absolute -top-2 -right-2 bg-white rounded-full cursor-pointer"
                        />
                      </div>
                    ))}
                  {/* render the images that are uploaded, this is been used for create the new images */}
                  {updatedImages &&
                    updatedImages.map((image, index) => {
                      return (
                        <div key={image.url} className="relative">
                          <img
                            src={image.url}
                            className="w-28 h-28 aspect-square object-cover"
                            alt="pet"
                          />
                          <CancelRoundedIcon
                            onClick={() => handleDeleteImage(image.url)}
                            className="absolute -top-2 -right-2 bg-white rounded-full cursor-pointer"
                          />
                        </div>
                      );
                    })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-orange-900 text-white rounded-xl hover:bg-red-800 hover:scale-105"
                  >
                    Save
                  </button>
                </div>
                <div>
                  <button
                    onClick={close}
                    className="w-full py-2 bg-orange-900 text-white rounded-xl hover:bg-red-800 hover:scale-105"
                  >
                    Close
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        ""
      )}
      <input type="text" onChange={(e) => handleSuburbChange(e.target.value)} />
    </div>
  );
}

export default EditPostPopup;
