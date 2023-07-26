import React, { useEffect, useState } from "react";
import FilterSelect from "./FilterSelect";
import { useLocalStorage } from "react-use";
import { useUserPost, useUserPostDispatch } from "../contexts/UserPostContext";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";

const api = process.env.REACT_APP_DATABASE_URL;

function EditPostPopup({ trigger, close, post, update, mode }) {
  const colorOptions = ["Yellow", "Black", "White", "Brown", "Grey", "Multi", "Cream"];

  const speciesOptions = ["Dog", "Cat", "Bird", "Rabbit", "Other"];

  const breedOptions = [
    {
      Dog: ["Dachshund", "Poodle", "Labrador", "Pug", "Other"]
    },
    {
      Cat: ["Persian", "Siamese", "Bengal", "Ragdoll", "Other"]
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
  const userPost = useUserPost();
  const navigate = useNavigate();

  const handleSuburbChange = (event) => {
    const suburbValue = event.target.value;
    setSuburb(suburbValue);
  };

  const handleColorChange = (event) => {
    const colorValue = event.target.value;
    setSelectedColor(colorValue);
  };

  const handleTitleChange = (event) => {
    const titleValue = event.target.value;
    setTitle(titleValue);
  };

  const handleDescriptionChange = (event) => {
    const descriptionValue = event.target.value;
    setDescription(descriptionValue);
  };

  const handleContactInfoChange = (event) => {
    const contactInfoValue = event.target.value;
    setContactInfo(contactInfoValue);
  };

  const handleStatusChange = (event) => {
    const statusValue = event.target.value;
    setSelectedStatus(statusValue);
  };

  const handleSpeciesChange = (event) => {
    const speciesValue = event.target.value;
    setSelectedSpecies(speciesValue);
    setSelectedBreed("");
  };

  const breedOptionsForSelectedSpecies = breedOptions.find((option) =>
    option.hasOwnProperty(selectedSpecies)
  );

  const breedOptionsList =
    breedOptionsForSelectedSpecies && breedOptionsForSelectedSpecies[selectedSpecies];

  const handleBreedChange = (event) => {
    const breedValue = event.target.value;
    setSelectedBreed(breedValue);
  };

  // for image upload
  const fileSelectedHandler = (event) => {
    const selectedFiles = event.target.files;
    const selectedFilesArray = Array.from(selectedFiles);
    const files = selectedFilesArray.map((file) => ({
      url: URL.createObjectURL(file),
      file: file
    }));
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

  // for create post
  const handleCreatePost = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("suburb", suburb);
      formData.append("status", selectedStatus);
      formData.append("description", description);
      formData.append("contactInfo", contactInfo);
      formData.append("color", selectedColor);
      formData.append("breed", selectedBreed);
      formData.append("species", selectedSpecies);
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
      // userPostDispatch({ type: "create", newPost: data });

      alert("Post has been created.");
      window.location.reload();

      close();
    } catch (error) {
      console.log(error);
    }
  };

  // for update post
  const handleUpdatePost = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("suburb", suburb);
      formData.append("status", selectedStatus);
      formData.append("description", description);
      formData.append("contactInfo", contactInfo);
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
      // userPostDispatch({ type: "create", newPost: data });

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
            <form className="flex flex-col gap-8">
              <TextField
                id="standard-basic"
                label="Title"
                variant="standard"
                onChange={handleTitleChange}
                value={title}
              />
              <div className="filter-container grid grid-cols-2 gap-2">
                <FilterSelect
                  label="species"
                  value={selectedSpecies}
                  options={speciesOptions}
                  onChange={handleSpeciesChange}
                  title="species" // Add the title prop for the first filter
                />
                {breedOptionsList && (
                  <FilterSelect
                    label="breed"
                    value={selectedBreed}
                    options={breedOptionsList}
                    onChange={handleBreedChange}
                    title="breed" // Add the title prop for the first filter
                  />
                )}
                <FilterSelect
                  label="color"
                  value={selectedColor}
                  options={colorOptions}
                  onChange={handleColorChange}
                  title="color" // Add the title prop for the first filter
                />
                <TextField
                  id="standard-basic"
                  label="Suburb"
                  variant="standard"
                  onChange={handleSuburbChange}
                  value={suburb}
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

              <TextField
                id="standard-basic"
                label="ContactInfo(Phone)"
                variant="standard"
                onChange={handleContactInfoChange}
                value={contactInfo}
              />

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

                {mode === "create" && (
                  <div className="images grid grid-cols-3 gap-4 text-orange-900">
                    {updatedImages &&
                      updatedImages.map((image, index) => {
                        return (
                          <div key={image.url} className="relative">
                            <img
                              src={image.url}
                              className="w-28 h-28 aspect-square object-cover"
                              alt="pet"
                            />
                            {/* <button onClick={() => handleDeleteImage(image.url)} className="absolute top-0 left-0 p-3 rounded-full">X</button> */}
                            <CancelRoundedIcon
                              onClick={() => handleDeleteImage(image.url)}
                              className="absolute -top-2 -right-2 bg-white rounded-full"
                            />
                          </div>
                        );
                      })}
                  </div>
                )}

                {mode === "update" && (
                  <div className="images grid grid-cols-3 gap-4 text-orange-900">
                    {selectedImages &&
                      selectedImages.map((image, index) => (
                        <div key={image} className="relative">
                          {console.log(image)}
                          <img
                            src={image}
                            className="w-28 h-28 aspect-square object-cover"
                            alt="pet"
                          />
                          <CancelRoundedIcon
                            onClick={() => handleDeleteOldImage(image)}
                            className="absolute -top-2 -right-2 bg-white rounded-full"
                          />
                        </div>
                      ))}
                    {updatedImages &&
                      updatedImages.map((image, index) => {
                        return (
                          <div key={image.url} className="relative">
                            <img
                              src={image.url}
                              className="w-28 h-28 aspect-square object-cover"
                              alt="pet"
                            />
                            {/* <button onClick={() => handleDeleteImage(image.url)} className="absolute top-0 left-0 p-3 rounded-full">X</button> */}
                            <CancelRoundedIcon
                              onClick={() => handleDeleteImage(image.url)}
                              className="absolute -top-2 -right-2 bg-white rounded-full"
                            />
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </form>
            <div className="flex justify-end gap-4">
              <button onClick={mode === "create" ? handleCreatePost : handleUpdatePost}>
                Save
              </button>
              <button onClick={close}>Close</button>
            </div>
          </div>
          {post && console.log(post._id)}
        </div>
      ) : (
        ""
      )}
      {console.log("selectedImages", selectedImages)}
      {console.log("updatedImages", updatedImages)}
    </div>
  );
}

export default EditPostPopup;