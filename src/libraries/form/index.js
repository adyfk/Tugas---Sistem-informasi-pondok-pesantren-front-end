import { useState, useEffect } from "react";
import { isEmpty } from "../../utils/object";

export default function useForm({ defaultValues = {}, schema = false }) {
  const [values, setValues] = useState(defaultValues);
  const [valid, setValid] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValid(isEmpty(errors));
  }, [errors]);

  useEffect(() => {
    if (schema !== false) {
      schema
        .validate(values, { abortEarly: false })
        .then(() => setErrors({}))
        .catch(err => {
          const errors = {};
          err.inner.forEach(error => {
            errors[error.params.path] = error;
          });
          setErrors(errors);
        });
    }
  }, [values]);

  const setValue = (param, value) => {
    setValues(prev => ({
      ...prev,
      [param]: value
    }));
  };
  const setError = (param, value) => {
    setErrors(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const onChange = e => {
    setValue(e.target.name, e.target.value);
  };

  const onChangeN = normalize => e => {
    setValue(setValue(e.target.name, normalize(e.target.value)));
  };

  const handleSubmit = onSubmit => e => {
    schema
      .validate(values, { abortEarly: false })
      .then(() => {
        onSubmit(values);
      })
      .catch(err => {
        const errors = {};
        if (typeof err === "object" && typeof err.inner === "object") {
          err.inner.forEach(error => {
            errors[error.params.path] = error;
          });
          setErrors(errors);
        }
      });

    e.preventDefault();
  };

  return {
    values,
    valid,
    setValue,
    setValues,
    errors,
    setError,
    onChange,
    onChangeN,
    handleSubmit
  };
}
