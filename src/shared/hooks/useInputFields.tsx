import { useEffect, useState } from 'react';

export interface InputField {
  field: string;
  value?: string;
  required: boolean;
}

export default function useInputFields(fields: Pick<InputField, 'field' | 'required'>[]) {
  // state
  const [inputs, setInputs] = useState<InputField[]>(fields.slice());
  const [valid, setValid] = useState<boolean>(false);

  // useEffect
  useEffect(() => {
    let isValid = true;

    for (const input of inputs) {
      if (input.required && !input.value) {
        isValid = false;
        break;
      }
    }

    setValid(isValid);
  }, [inputs]);

  // handle
  const handleChange = ({ field, value }: { field: string; value?: string }) => {
    setInputs(inputs.map((input) => (input.field === field ? { ...input, value } : input)));
  };

  const handleGetValue = (field: string) => {
    for (const input of inputs) {
      if (input.field === field) {
        return input.value ?? '';
      }
    }

    return '';
  };

  const handleResetAll = () => {
    setInputs(inputs.map((input) => ({ ...input, value: undefined })));
  };

  return { inputs, valid, onInputChange: handleChange, onInputValue: handleGetValue, onResetAll: handleResetAll };
}
