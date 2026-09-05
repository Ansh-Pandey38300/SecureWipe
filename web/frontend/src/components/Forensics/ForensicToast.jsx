import toast from "react-hot-toast";

export const forensicToast = {
    success(message) {
        toast.success(message);
    },

    error(message) {
        toast.error(message);
    },

    loading(message) {
        return toast.loading(message);
    },

    dismiss(id) {
        toast.dismiss(id);
    },
};

export default forensicToast;