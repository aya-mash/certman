import { Field, useField } from "formik";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Props = {
  name: string;
  placeholder: string;
  label: string;
  options: { label: string; value: string }[];
};

const FormikSelectField = ({ name, label, placeholder, options }: Props) => {
  const [, { value, error }, { setValue }] = useField(name);
  return (
    <Field
      component={Select}
      id={name}
      name={name}
      label={label}
      aria-describedby={`${name}-error`}
      aria-errormessage={`${name}-error`}
      aria-label={name}
      aria-required="true"
      className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
      placeholder={placeholder}
      onValueChange={(value: string) => setValue(value)}
      value={value}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={`Select a ${label}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="px-2 py-1.5 text-sm font-semibold">
            {label}
          </SelectLabel>
          {options.map(({ label, value }, index) => (
            <SelectItem key={value + index} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
      {error && <div className="text-red-500 text-sm pl-2">{error}</div>}
    </Field>
  );
};

export default FormikSelectField;
