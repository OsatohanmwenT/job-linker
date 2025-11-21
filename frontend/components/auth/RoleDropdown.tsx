import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";
import { ROLE_ARRAY_TYPE } from "@/constants";

interface RoleDropdownProps<T extends FieldValues> {
  field: ControllerRenderProps<T, Path<T>>;
  fieldState: ControllerFieldState;
  roles: ROLE_ARRAY_TYPE;
}

const RoleDropdown = <T extends FieldValues>({
  field,
  fieldState,
  roles,
}: RoleDropdownProps<T>) => {
  return (
    <Select
      {...field}
      onValueChange={field.onChange}
      defaultValue={field.value}
    >
      <SelectTrigger
        className="w-[180px] shadow-none h-auto rounded-sm"
        aria-invalid={fieldState.invalid}
      >
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent className="font-mono">
        {roles.map((role) => (
          <SelectItem key={role} value={role}>
            {role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default RoleDropdown;
