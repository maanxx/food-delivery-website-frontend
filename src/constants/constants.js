const regexNumbers = /[^\d]/g;
const regexEmail =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/;
const regexVietnamPhoneNumber = /^[0-9]{9}$/;

export { regexNumbers, regexEmail, regexVietnamPhoneNumber };
