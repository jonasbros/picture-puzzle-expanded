const validation = {
  validation: {
    puzzle: {
      title: {
        required: "Title is required",
        tooLong: "Title too long",
        tooShort: "Title must be at least 2 characters",
      },
      url: {
        invalid: "Invalid URL format",
      },
    },
    common: {
      required: "This field is required",
      invalid: "Invalid format",
    },
  },
};

export default validation;
