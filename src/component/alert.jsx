import React from "react";
import Swal from "sweetalert2";

export const AlertSuccess = () => {
  Swal.fire({
    title: "success",
    icon: "success",
    draggable: true,
  });
};

export const AlertError = () => {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "Something went wrong!",
  });
};
