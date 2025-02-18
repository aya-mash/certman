import { Field, useField } from "formik";
import { Input } from "./ui/input";

type Props = {
  name: string;
  placeholder: string;
  label: string;
};

const FormikInputField = ({ name, label, placeholder }: Props) => {
  const [field, { error }] = useField(name);
  return (
    <div className="space-y-1">
      <label
        htmlFor="domain"
        className="block text-sm font-medium text-gray-700 pl-2"
      >
        {label}
      </label>
      <Field
        component={Input}
        id={name}
        aria-describedby={`${name}-error`}
        aria-errormessage={`${name}-error`}
        aria-label={name}
        aria-required="true"
        className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
        placeholder={placeholder}
        {...field}
      />
      {error && <div className="text-red-500 text-sm pl-2">{error}</div>}
    </div>
  );
};

export default FormikInputField;
