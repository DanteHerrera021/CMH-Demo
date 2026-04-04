import { Check, CircleSlash } from "lucide-react";
import { toast, Slide } from "react-toastify";

function toastError(message) {
    toast.error(message, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        icon: CircleSlash,
        transition: Slide
    });
}

function toastSuccess(message) {
    toast.success(message, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        icon: Check,
        transition: Slide
    });
}

export { toastError, toastSuccess };