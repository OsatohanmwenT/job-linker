import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl } from "@/components/ui/form";
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
  roles,
}: RoleDropdownProps<T>) => {
  return (
    <Select
      onValueChange={field.onChange}
      defaultValue={field.value}
      value={field.value}
    >
      <FormControl>
        <SelectTrigger className="w-[180px] shadow-none h-auto rounded-sm">
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
      </FormControl>
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
