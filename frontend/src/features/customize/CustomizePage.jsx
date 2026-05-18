import { useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { RiImageAddLine } from "react-icons/ri";
import { MdKeyboardBackspace } from "react-icons/md";
import { userDataContext } from "../../context/userContext";
import { AssistantImageCard } from "./AssistantImageCard";
import { PRESET_ASSISTANT_IMAGES } from "./constants";

export default function CustomizePage() {
  const {
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage,
  } = useContext(userDataContext);
  const navigate = useNavigate();
  const inputImage = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p-[20px] ">
      <MdKeyboardBackspace
        className="absolute top-[30px] left-[30px] text-white cursor-pointer w-[25px] h-[25px]"
        onClick={() => navigate("/")}
      />
      <h1 className="text-white mb-[40px] text-[30px] text-center ">
        Vui lòng chọn <span className="text-blue-200">hình ảnh trợ lý</span>
      </h1>
      <div className="w-full max-w-[900px] flex justify-center items-center flex-wrap gap-[15px]">
        {PRESET_ASSISTANT_IMAGES.map((src, index) => (
          <AssistantImageCard key={index} image={src} />
        ))}
        <div
          className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#020220] border-2 border-[#0000ff66] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-white flex items-center justify-center ${
            selectedImage === "input"
              ? "border-4 border-white shadow-2xl shadow-blue-950 "
              : ""
          }`}
          onClick={() => {
            inputImage.current.click();
            setSelectedImage("input");
          }}
        >
          {!frontendImage && (
            <RiImageAddLine className="text-white w-[25px] h-[25px]" />
          )}
          {frontendImage && (
            <img src={frontendImage} className="h-full object-cover" alt="" />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={inputImage}
          hidden
          onChange={handleImage}
        />
      </div>
      {selectedImage && (
        <button
          type="button"
          className="min-w-[150px] h-[60px] mt-[30px] text-black font-semibold cursor-pointer  bg-white rounded-full text-[19px] "
          onClick={() => navigate("/customize2")}
        >
          Next
        </button>
      )}
    </div>
  );
}
